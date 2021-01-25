# Vue3.0（二）：CompositionAPI

本章节主要总结一下CompositionAPI的使用方式，和在使用的时候一些注意事项。如果对CompositionAPI比较熟悉并且想要了解原理可以直接查看结尾原理分析阶段。

## 常规使用

CompositionAPI相关的内容大体分为几类：

- setup
- 响应性API
- 生命周期钩子
- watch
- computed

watch，computed和生命周期钩子都是Vue以函数式的形式暴露出来，并无太多变化所以暂且不提，这里主要说一下setup和响应性API。



### setup

setup函数可以理解为是compositionAPI注入的地方，先看看它的使用

````js
import { createApp } from 'vue'

const app = createApp({
	setup() {
		// ...
	}
})
````

这个setup在生命周期中的执行时机为可以看下图

![image-20210121180224655](https://tva1.sinaimg.cn/large/008eGmZEgy1gmvh1w50qej30kw0bodgx.jpg)

可以看到你可以在setup中做原来Vue2.0中`created`与`beforeCreated`函数做的事情，与此同时还需要注意的是**setup的执行时机是在实例创建之前，这就意味着我们在setup中只能访问setup中注入的两个参数`prop`和`context`，其他诸如：data、method、computed均无法访问**

prop和context一共包括的下面这些东西

````js
import { createApp } from 'vue'

const app = createApp({
	setup(props, context) {
		console.log(props) // props
    console.log(context.props) // props
    console.log(context.attrs) // attrs
    console.log(context.emit) // emit
    console.log(context.solts) // solts
    console.log(context.expose) // expose
	}
})
````

关于expose，这是一个rfcs中的提案，我大概看了一下是指定组件向父组件通过ref获取子组件可访问的内容，但是官方文档貌似还没看到更新。有兴趣的小伙伴可以在[这里了解详细](https://github.com/Jinjiang/rfcs/blob/master/active-rfcs/0000-expose-api.md)，其余均是Vue2.0的属性就不过多赘述。

>  ⚠️还有一点需要注意的是：props不能直接进行解构读取，要通过toRefs进行包装之后才可以进行解构，这点我们之后会进行分析



### 响应性API

由于CompositionAPI是函数形式，并不能像Vue2.0一样在new Vue实例化的过程中进行响应式处理，所以相应的Vue3.0也为我们提供了很多响应性API，详细可以看[这里](https://vue-docs-next-zh-cn.netlify.app/api/basic-reactivity.html)。我们这里主要列出几种详细剖析

1. reactive
2. ref
3. readonly



#### reactive

我们将对象变成响应式对象，只需要直接调用reactive AP即可，这会为我们创建一个Proxy代理，从而进行对应的视图更新

````js
import { reactive } from 'vue'

function myCompositionAPI() {
  let person = reactive({name: 'Mike'})
  
  person.name = 'Bob'
  person.age = 18
  
  return { person }
}
````



#### ref

使用reactive有个问题就是我们没法通过Proxy让一个基础类型进行响应式，比如一个数字或者一个字符串，所以Vue3.0提供了ref来解决这个问题

````js
import { ref } from 'vue'

function myCompositionAPI() {
  let count = ref(0)
  
  function add() {
    count.value += 1 // 注意我们需要通过value调用进行更改，具体为什么需要这样做之后会在源码部分进行分析
  }
  
  return { count, add }
}
````



#### readonly

当我们不希望在composition内部的变量在外部被更改的时候，可以通过readonly进行包装让他变成一个只读对象

````js
// 直接套用官方文档的例子
const original = reactive({ count: 0 })

const copy = readonly(original)

watchEffect(() => {
  // 适用于响应性追踪
  console.log(copy.count)
})

// 变更original 会触发侦听器依赖副本
original.count++

// 变更副本将失败并导致警告
copy.count++ // 警告!
````



这些compositionAPI我初次使用的时候会有一个疑问，为什么有的包装对象需要调用value属性进行读取和赋值，而有的对象可以直接读取和赋值呢？因为按照写Vue2.0的直觉，我一开始用Vue3.0写会这样做

````js
function myCompositionAPI() {
  let userInfo = reactive({ name: '', age: 0 })
  
  async function fetchUserInfo() {
		const userInfoFromServer = await getUserInfo()
    userInfo = userInfoFromServer // 这样会失去响应式
  }
}
````

这样会失去响应式，于是我换了个做法

````js
function myCompositionAPI() {
  let userInfo = ref(null)
  
  async function fetchUserInfo() {
		const userInfoFromServer = await getUserInfo()
    userInfo.value = userInfoFromServer // 这样就不会丢失响应式
  }
}
````

使用ref就可以了，这是为什么呢？还有为什么ref必须要通过value进行调用？以及我们之前的问题为什么props需要通过toRefs进行包装才能解构，这些都是我们未解决的问题，接下来我们将走进Vue3.0的源码进行分析



## 原理分析

梳理一下我们之前在使用场景留下的困惑

1. 为什么reactive直接赋值会取消响应式
2. 为什么ref通过value赋值，并且赋值时不会取消响应式
3. toRefs是什么，为什么解构props需要toRefs进行包装



想要搞清楚这几个点，我们将分别分析`reactive`、`ref`、`toRefs`源码逻辑。

源码分析篇章

- reactive源码分析
- ref源码分析
- toRefs源码分析

