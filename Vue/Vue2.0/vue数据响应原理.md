# Vue数据响应原理剖析

Vue的数据响应原理可以说是Vue框架的一个核心部分，大部分人都了解个概念：**Vue通过设置实例对象属性的存取描述符（accessor descriptors）中的get和set监听数据，然后通过观察者模式进行依赖收集和派发更新。**

虽然了解了概念但是真正看Vue源码时，我还是会有些疑惑。比如：

1. 一个观察者模式只需要设计一个类不就行了吗？为什么要设计一个Dep类和一个Watcher类？而且为什么这两个类的实例在源码里相互调用，看得我一脸懵逼
2. Dep.target是个什么东西，为什么大家都说它是一个很巧妙的设计？



其实Vue的数据响应原理并不难，整个数据响应原理我分为这两部分：

1. **监听对象的变化**：将普通对象变成可观察对象
2. **观察者模式应用**：设计实现一个观察者模式进行收集和观察



## 监听对象变化

我们可以通过*Object.definedProperty*这个方法定义属性的getter和setter，从而完成对对象的监听。如果对*Object.definedProperty*还不太了解，可以先看[这里](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)。

接下来我们写一个方法，能把一个对象变得可观察（当这个对象的属性变化和读取的时候我们都能监听到）

````js
// 将普通对象转化为可观察对象
function observe (obj) {
  for (let key in obj) {
		definedProperty(obj, key, obj[key])
  }
  return obj
}

function definedProperty (obj, key, value) {
  Object.defineProperty(obj, key, {
    get () {
    	console.log(key + '属性被读取')
    	return value
  	},
		set (newValue) {
      console.log(key + '属性由' + value + '变更为' + newValue)
    	value = newValue
  	}
  })
}
````

整个思路就是通过遍历对象属性，完成对每个属性的get和set改写，将他们变成可观察对象，我们可以稍微验证一下：

````js
let hero = observe({
  HP: 1000,
  strength: 10
})

hero.HP // HP属性被读取
hero.HP = 500 // HP属性由1000变更为500
````

这样我们就很容易的完成了对与对象的监听，接下来我们就要介绍重点部分：Vue对与观察者模式的应用。

## 观察者模式应用

我们之前通过observe定义了一个hero英雄，现在这个英雄要和大家一起组队下副本了，我们需要为hero添加一个健康状态，一旦HP低于20，则视为濒死状态进行警告，否则为正常。

我们设计一个watcher方法来为他添加这个健康状态

````js
// hero为对象
// status是新加的属性名称，它是一个随HP变化的计算属性
// 最后是status的赋值方法
watcher(hero, 'status', () => {
  return hero.HP < 20 ? '濒死' : '健康'
})
````

可以看到我们的`status`状态需要依赖于`HP`的数值。然后我们试着实现一下这个`watcher`方法

````js
function watcher (obj, key, cb) {
  Object.defineProperty(obj, key, {
    get () {
      let val = cb()
      return val
    },
    set () {
      console.error('计算属性不可以赋值')
    }
  })
}
````

别忘了我们需要在hero濒死的时候进行通知，因为要及时加血，否则hero很容易就挂了。

````js
// 通知方法
function onComputedUpdate (val) {
	console.log('英雄目前的状态是' + val)
}

function watcher (obj, key, cb) {
  Object.defineProperty(obj, key, {
    get () {
      let val = cb()
      onComputedUpdate(val)
      return val
    },
    set () {
      console.error('计算属性不可以赋值')
    }
  })
}

watcher(hero, 'status', () => {
  return hero.HP < 20 ? '濒死' : '健康'
})

hero.status // 健康
hero.HP = 10
hero.status // 濒死
````

目前我们设计的这个只能在我们读取`hero.status`时才能获取英雄状态，我们总不能打个副本一直读取英雄状态吧，那还怎么操作？

我们希望的是当`HP`变化的时候，它（HP）能主动通知我们`status`的状态进行变化并且发出警告。但是问题来了：**`HP`的getter和setter中并不知道`status`的赋值逻辑，那怎么知道status什么时候变化呢？**

其实很简单，我们只需要把`status`的赋值逻辑告诉给`hp`不就好了吗？**既然`hp`和`status`的逻辑不在一起，我们就用一个全局的第三方帮他们进行传递。**

````js
// Dep就是帮忙传递status赋值逻辑的第三方
const Dep = {
	target: null
}

function watcher (obj, key, cb) {
  const onDepUpdated = () => { // 我们需要传递的东西定义在这里，就是status的对应通知
    // 因为hp并不知道status的赋值方法，所以我们要把cb存下来
    const val = cb()
    onComputedUpdate(val)
  }

  Object.defineProperty(obj, key, {
    get () {
      Dep.target = onDepUpdated // 划重点
      let val = cb()
      Dep.target = null // 划重点
      return val
    },
    set () {
      console.error('计算属性不可以赋值')
    }
  })
}
````

可以看到我们做了一个看似奇怪的操作：`Dep.target = onDepUpdated`和`Dep.target = null`但是并没有使用，这也是Vue源码里比较精髓的一个做法。接下来我们详细的剖析一下这是为什么？

首先我们回忆一下，**我们定义`Dep.target`的目的是什么？**是给`hp`变化的时候让他调用啊！所以肯定是要`hp`来调用，`hp`的get和set被定义在我们之前的`definedProperty`方法中，所以我们接下来填充一下`definedProperty`方法。

````js
function definedProperty (obj, key, value) {
  const deps = [] // 用于存放依赖该属性的计算属性们，比如hp的deps就有status
  
  Object.defineProperty(obj, key, {
    get () {
      // 划重点：收集依赖
      if (Dep.target && deps.indexOf(Dep.target) === -1) {
        deps.push(Dep.target)
      }

    	console.log(key + '属性被读取')
    	return value
  	},
		set (newValue) {
      console.log(key + '属性由' + value + '变更为' + newValue)
    	value = newValue
      // 划重点：派发更新
      deps.forEach(dep => {
        dep()
      })
  	}
  })
}
````

可以看到，我们通过定义一个`deps`来收集依赖该属性的计算属性们。为什么是在get中定义呢？还记得吗，以`status`举例：**我们的依赖`hp`的`status`在赋值的时候会读取`hp`属性的值，从而会触发`hp`属性的getter，由于我们之前在watcher中有为Dep.target赋值，所以证明这个读取是计算属性的赋值cb读取的，从而就可以通过deps.push收集这个依赖。由于js是单线程的，所以无需担心Dep.target此刻会被其他地方赋值**。这就是精髓所在，不太懂的话，建议反复看一下一段话的意思。

现在我们再来测试一下

````js
let hero = observe({
  HP: 1000,
  strength: 10
})

watcher(hero, 'status', () => {
  return hero.HP < 20 ? '濒死' : '健康'
})

hero.status // HP属性被读取
hero.HP = 10 // HP属性由1000变更为10 HP属性被读取 英雄目前的状态是濒死
````

由此我们就完成了Vue的数据响应原理的基本版，完整代码如下：

````js
const Dep = {
	target: null
}

function onComputedUpdate (val) {
	console.log('英雄目前的状态是' + val)
}

function definedProperty (obj, key, value) {
  const deps = [] // 用于存放依赖该属性的计算属性们，比如hp的deps就有status
  
  Object.defineProperty(obj, key, {
    get () {
      // 划重点：收集依赖
      if (Dep.target && deps.indexOf(Dep.target) === -1) {
        deps.push(Dep.target)
      }

    	console.log(key + '属性被读取')
    	return value
  	},
		set (newValue) {
      console.log(key + '属性由' + value + '变更为' + newValue)
      value = newValue
      // 划重点：派发更新
      deps.forEach(dep => {
        dep()
      })
  	}
  })
}

function watcher (obj, key, cb) {
  const onDepUpdated = () => { // 我们需要传递的东西定义在这里，就是status的对应通知
    // 因为hp并不知道status的赋值方法，所以我们要把cb存下来
    const val = cb()
    onComputedUpdate(val)
  }

  Object.defineProperty(obj, key, {
    get () {
      Dep.target = onDepUpdated // 划重点
      let val = cb()
      Dep.target = null // 划重点
      return val
    },
    set () {
      console.error('计算属性不可以赋值')
    }
  })
}

// 将普通对象转化为可观察对象
function observe (obj) {
  for (let key in obj) {
		definedProperty(obj, key, obj[key])
  }
  return obj
}

let hero = observe({
  HP: 1000,
  strength: 10
})

watcher(hero, 'status', () => {
  return hero.HP < 20 ? '濒死' : '健康'
})

hero.status
hero.HP = 10
````

完成了基本代码，接下来我们进行一些解耦和封装操作。

## 优化为Vue源码形态

我们首先把`definedProperty`中`deps`相关的逻辑拆出统一集合到`Dep`中作为一个独立的类进行封装，因为`definedProperty`无需关心依赖收集的相关逻辑

````js
/** Dep完成属性收集和派发依赖功能 */
class Dep {
  target = null
  
  constructor () {
    this.deps = []
  }

  addDep () {
    if (Dep.target && this.deps.indexOf(Dep.target) === -1) {
      this.deps.push(Dep.target)
    }
    this.deps.push(Dep.target)
  }

  notify () {
    this.deps.forEach(dep => {
      dep()
    })
  }
}
````

接下来我们把`observe`相关的逻辑也封装为一个类，将原来`deps`的部分改为使用`Dep`实例的方式

````js
/** Observe 将对象转化为响应式对象 */
class Observe {
  constructor (obj) {
    return this.walk(obj)
  }

  walk (obj) {
    for (let key in obj) {
      this.defineReactive(obj, key, obj[key])
    }
    return obj
  }

  defineReactive (obj, key, val) {
    const dep = new Dep()

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        dep.addDep()
        console.log(key + '属性被读取')
        return val
      },
      set (newValue) {
        if (val === newValue) {
          return
        }
        console.log(key + '属性由' + value + '变更为' + newValue)
        val = newValue
  
        // 派发更新
        dep.notify()
      }
    })
  }
}
````

最后把我们的`watcher`也封装一下

````js
/** Watcher 负责定义对应的监听属性 */
class Watcher {
  constructor (obj, key, cb, onComputedUpdate) {
    this.obj = obj
    this.key = key
    this.cb = cb
    this.onComputedUpdate = onComputedUpdate

    return this.defineComputed()
  }

  defineComputed () {
    const onDepUpdated = () => {
      const val = this.cb()
      this.onComputedUpdate(val)
    }

    Object.defineProperty(this.obj, this.key, {
      enumerable: true,
      configurable: true,
      get: () => {
        Dep.target = onDepUpdated
        const val = this.cb()
        Dep.target = null
        return val
      },
      set: () => {
        console.error('计算属性不可以赋值')
      }
    })
  }
}
````

最后验证一下

````js
const hero = new Observe({
  HP: 1000,
  strength: 10
})

new Watcher(hero, 'status', () => {
  return hero.HP < 20 ? '濒死' : '健康'
}, (val) => {
  console.log('英雄目前的状态是' + val)
})

hero.status // 健康
hero.HP = 10 // HP属性由1000变更为10 HP属性被读取 英雄目前的状态是濒死
````

最终我们就完整的理解下来整个Vue数据响应原理设计了～

本文思路也是参考了https://zhuanlan.zhihu.com/p/29318017这篇优秀的文章，大家感兴趣也可以去看一下

## 总结

综合以上，当时我看Vue源码这部分时还是有些懵逼的，看了一些文章和教程也是一知半解。我觉得大部分文章是当我懂了之后作为回顾才发现恍然大悟，不懂的时候看完也只能是了解一个大体的概念。

究其原因可能是**大家更多是结合自己已知的设计思想对源码进行分析，大多数写对应文章的人看之前是对相关思想有一些理解的，所以他们在写文章的时候默认你也是懂得这些概念的。**如果很遗憾你并不懂这些概念或者理解不够深刻，那就可能觉得看这些东西都会一头雾水，这也是信息需要全量传输的必要性。

所以先了解思想，写一个demo，再去看对应的源码设计和实现。个人觉得才是一个更加有效理解的手段。

