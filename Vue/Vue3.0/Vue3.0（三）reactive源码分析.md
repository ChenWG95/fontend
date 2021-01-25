# Vue3.0（三）reactive源码分析

本章节将告诉你为什么之前reactive直接赋值会无效，以及Vue3.0的响应性系统是如何实践的。



## 精简的reactive过程

我把源码精简了一下带大家看一下reactive背后具体执行了什么

````js
const proxyMap = new WeakMap()

const mutableHandlers = {
  set: createSetter(),
  get: createGetter()
}

function reactive(target) {
  return createReactiveObject(target, mutableHandlers);
}

function createReactiveObject(target, mutableHandlers) {
  // mutableHandlers中创建 get & set 收集依赖
  let proxy = new Proxy(target, mutableHandlers)
  // 收集target对应的proxy
  proxyMap.set(target, proxy)
  return proxy
}
````

宏观上reactive进行了上面这一套操作，我们大体逻辑是这样的：

1. 为传入的对象target通过Proxy包装
2. 设置proxyMap对应的target与proxy映射

**在对象通过Proxy包装时，我们可以通过指定handler的方式定制对象的get与set行为，这里的handler就是mutableHandlers，可以看到这里的get与set是通过函数创建的，其中分别对应着我们的响应性的依赖收集与响应派发对应逻辑。**

> 对于Proxy不熟悉的小伙伴可以先看这里熟悉一下[Proxy API](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)和[Reflect API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)，之后的逻辑都会基于这两个基础，所以务必要清楚



## 依赖收集

我们之前说依赖收集在createGetter函数中，createGetter函数精简版如下：

````js
function createGetter() {
  return function(target, k, receiver) {
      // 收集依赖
      track(target, 'get', k)
      // 输出读取值
      return Reflect.get(target, k, receiver)
  }
}
````

在createGetter函数中可以看到通过track进行依赖收集，由于createGetter最终是赋值给了上面mutableHandlers的get，所以当target对象的属性读取触发get时，即会调用track函数进行依赖收集，然后我们再看看track函数

````js
const targetMap = new WeakMap()

function track(target, type, k, v) {
  // 寻找对应的依赖，没有则创建
  let depsMap = targetMap.get(target)
  if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(k)
  if (!dep) {
      depsMap.set(k, (dep = new Set()))
  }

  // 收集对应的副作用函数，track的时候要先把activeEffect设置为当前key的副作用函数
  if (!dep.has(activeEffect)) {
      dep.add(activeEffect)
      activeEffect.deps.push(dep)
  }
}
````

track函数基本做了两件事：

1. 创建一个 targetMap => depsMap => dep 的依赖关系，就像是下图一样

![image-20210122122155053](https://tva1.sinaimg.cn/large/008eGmZEgy1gmwctw2524j30ze0homyi.jpg)

**targetMap记录所有target和对应依赖，每个target有一个自己的依赖map叫做depsMap，然后这个target对象里面的每个key又会有自己的dp收集相关的effect副作用函数，最终通过这种联系创建一个依赖关系**

> 这里需要注意的是targetMap是一个WeakMap，[WeakMap](const proxyMap = new WeakMap())是对象的弱引用，这样可以及时释放无用target对象的占用内存，也是Vue3.0的优化手段

2. 将activeEffect收集至dep中，activeEffect指的是当前的副作用

**通过这种方式，我们就能将这些effect副作用函数收集起来，当对应的key修改时，对应dep的effect副作用函数们就会依次执行。**



## 响应派发

我们之前说响应派发在createSetter函数中，createSetter函数精简版如下：

````js
function createSetter() {
  return function(target, k, v, receiver) {
      const oldVal = target[k]
      // 设置属性
      Reflect.set(target, k, v, receiver)
      // 根据之前的proxy是否存在属性判断ADD/SET触发副作用
      const hasKey = Object.prototype.hasOwnProperty(target, k)
      
      if (!hasKey) {
        	// 添加属性
          trigger(target, 'add', k, v)
      } else {
        	// 修改属性
          trigger(target, 'set', k, v, oldVal)
      }
  }
}
````

在createSetter函数中可以看到主要也做了两件事：

1. 先通过Reflect.set设置属性，从而跳过set handler的相关逻辑
2. 根据target是否存在set赋值的对应key，来区分通过trigger触发对应key值的添加/更新

我们看看trigger是如何进行响应派发的

````js
function trigger(target, type, k, v, oldVal) {
  // 获取target的depsMap
  const depsMap = targetMap.get(target)

  if (!depsMap) {
    return
  }

  const effects = new Set()

  // 添加副作用数组并去重
  function add (effectsToAdd) {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        effects.add(effect)
      })
    }
  }

  // 调度执行副作用函数
  function run (effect) {
    if (effect.options.scheduler) { // 调度执行
      effect.options.scheduler(effect)
    } else { // 直接执行
      effect()
    }
  }

  // 如果key不等于undefined，找到对应的effect添加副作用
  if (k !== void 0) {
    add(depsMap.get(k))
  }

  // 遍历执行副作用函数
  effects.forEach(run)
}
````

整个trigger整体逻辑就是：**将我们之前通过track收集的effect副作用函数进行执行，以此来实现响应派发。**



那么问题来了：我们依赖收集的effect是什么呢？activeEffect又是如何生成的插入依赖中的呢？接下来我们来看一下effect

## effect

effect函数也就是副作用函数可以理解为是当属性变化之后，对应对于该属性有依赖的地方要进行变更。举个例子

````js
var count = reactive({ num: 0 })

// 当count中的num改变时，我们希望触发onCountNumberChange函数
function onCountNumberChange() {
  console.log('count的num值改变了！', count.num)
}
````

如果要满足上述条件，在count改变时执行onCountNumberChange，那么我们就需要将它进行作为依赖被收集，回顾我们track是如何收集副作用依赖的

````js
function track() {
  // ...
  
  // 收集对应的副作用函数，track的时候要先把activeEffect设置为当前key的副作用函数
  if (!dep.has(activeEffect)) {
      dep.add(activeEffect)
      activeEffect.deps.push(dep)
  }
}
````

这里的activeEffect是一个全局对象，所以我们只需要在对count进行依赖收集时，把onCountNumberChange赋值给activeEffect即可，也就是这样:

````js
activeEffect = onCountNumberChange
````

Vue3中有一个effect函数是用来生成effect的，我们可以看下代码实现

````js
function effect(fn, options = EMPTY_OBJ) {
  if (isEffect(fn)) {
    // 如果 fn 已经是一个 effect 函数了，则指向原始函数
    fn = fn.raw
  }
  // 创建一个 wrapper，它是一个响应式的副作用的函数
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    // lazy 配置，计算属性会用到，非 lazy 则直接执行一次
    effect()
  }
  return effect
}
````

可以看到effect代码内部调用了createReactiveEffect函数，这个函数主要做的事情就是创建函数执行和activeEffect指向的集合，我们看下代码

````js
// 创建 设置activeEffect 和 函数执行 的集合
function createReactiveEffect(fn, options) {
  // 将activeEffect指向fn 和 fn执行
  const effect = function reactiveEffect(...args) {
    if (!effectStack.includes(effect)) {
      // 清空 effect 引用的依赖，防止在不渲染的情况下执行无用effect
      cleanup(effect)
      try {
        // 开启全局 shouldTrack，允许依赖收集
        enableTracking()
        // 压栈
        effectStack.push(effect)
        activeEffect = effect
        // 执行原始函数
        return fn(...args)
      }
      finally {
        // 出栈
        effectStack.pop()
        // 恢复 shouldTrack 开启之前的状态
        resetTracking()
        // 指向栈最后一个 effect
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  
  // 标识是一个 effect 函数
  effect._isEffect = true
  // effect 自身的状态
  effect.active = true

  return effect
}
````

关于effect栈部分我们之后再说，这里主要看这一部分

````js
activeEffect = effect
return fn(...args)
````

**这样我们就完成了先设置activeEffect为effect，然后执行fn函数，由于fn函数中有依赖部分的读取（以count.num为例就是count.num）会触发对应的count.num的get，之后get触发track进行依赖收集，此时依赖收集的activeEffect就是我们之前赋值的effect。**最后finally中会将activeEffect进行一些归位操作，防止activeEffect的赋值错误。

> 这里和Vue2.0中的Dep.target机制有一些相似之处，有兴趣的小伙伴可以看我之前的[Vue2.0数据响应分析](https://zhuanlan.zhihu.com/p/271383465)



### effect栈

我们看到effect会有一个effect栈，这主要还是为了解决嵌套场景下的effect赋值问题。我们举个例子

````js
var count = reactive({ num: 0 })

// 当count中的num改变时，我们希望触发onCountNumberChange函数
function onCountNumberChange() {
  // 我们新增一个副作用函数在onCountMuberChange之前执行
  effect(() => { console.log('前置函数', count.num) })
  console.log('count的num值改变了！', count.num)
}

effect(onCountNumberChange)
````

这种情况我们如果没有栈，直接赋值的话就会出现

1. effect(onCountNumberChange)，activeEffect指向onCountNumberChange
2. 执行onCountNumberChange时，先执行effect前置函数，activeEffect指向前置函数
3. onCountNumberChange执行时收集的activeEffect此时还是前置函数，所以此时的activeEffect错误

所以我们需要一个effect栈进行管理，从而保证effect的准确性



## 问题回顾

读了reactive源码也就能解释我们之前的问题了，为什么reactive直接赋值会取消响应式。

原因就是reactive函数会返回一个Proxy包装的对象，所以当我们这样直接赋值时

````js
let userInfo = reactive({ name: 'Mike' }) 

userInfo = await getUserInfo()
````

这样赋值的话，就会把Proxy对象给覆盖掉，从而无法触发对应的set和get，最终就会导致丢失掉响应性了，那么我们的第二个问题就来了：为什么通过ref包装的value赋值不会丢失响应性呢？这里的原因我们需要在下一篇章分析ref函数才能知道

