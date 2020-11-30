# vue nextTick解析

nextTick是vue的一个核心实现，但是本质上代码并不复杂。我们本章就来介绍一下nextTick的实现原理以及其中涉及的一些不太常见的WebAPI

## nextTick是什么

我们首先了解一下nextTick是什么？以及为什么vue要设计这样一个API供我们使用？

我们从之前的[vue数据响应式原理剖析](https://zhuanlan.zhihu.com/p/271383465)可以了解到，我们的vue框架的核心思想是**数据驱动**的。说简单点就是希望前端研发们只需要关注应用状态的数据变更，不需要关心随着数据变更带来的视图上的DOM变更。也就是说其实**当我们变更应用状态时，带来的DOM变化是vue框架帮我们做的**。

那么我们会有一个问题：**我们在使用vue进行页面开发时修改的只是应用状态或数据，具体的DOM是什么时候变化的我们并不知道**。

这样的话当你修改一个数据要获取对应变更后的DOM结构就会比较困难，我们总不能每一处都写一个setTimeout来保证获取到变更后的DOM结构吧？为了解决这个问题，vue就为我们提供了一个功能：nextTick，通过它，我们可以保证获取到变更后最新的DOM结构。

> vue的数据状态变更后，会触发一系列的watcher回调，多个数据状态的变更可能会多次触发一个watcher的回调函数。所以vue会对这些变化进行一系列的去重操作。这整个过程是一个异步过程，详细可以参考[官方文档](https://cn.vuejs.org/v2/guide/reactivity.html#%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E9%98%9F%E5%88%97)或源码的setter部分实现。

**重点是：你要知道从数据更改到DOM更新的这个过程，是一个异步操作**



知道浏览器的JavaScript事件循环的同学可以了解到，我们的浏览器中JavaScript的事件循环大概是这样一个过程

````js
for (macroTask of macroTaskQueue) { // 遍历所有宏服务
    // 1. 执行当前宏服务下的所有同步任务
    handleMacroTask();
      
    // 2. 遍历执行当前宏服务下的微服务
    for (microTask of microTaskQueue) {
        handleMicroTask(microTask);
    }
}
````

对于宏服务与微服务不了解的同学可以参考[这里](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)熟悉一下概念。



简单来说就是我们的页面中JavaScript执行是由一个个宏任务（MacroTask）组成的，宏任务（MacroTask）里面会包含一系列的同步任务和微任务（microTask）。我们会先把同步任务执行完，再执行微任务（microTask），都完成后会依旧按照原来的顺序去执行下一个宏任务。



为什么要说这个呢？我们之前说过**vue数据更改到DOM更新的这个过程，是一个异步操作**，他会产生一个微任务，所以如果你在代码里这样写

````js
mounted () {
  this.name = 'chenmingming'
	const nameDom = document.querySelector('.name')
  console.log(nameDom.innerText) // 这里获取不到最新的name
}
````

我们把vue框架的实现也写在里面，它的完整执行过程其实是这样的

````js
mounted () {
  this.name = 'chenmingming'
	const nameDom = document.querySelector('.name')
  console.log(nameDom.innerText) // 这里获取不到最新的name
  
  updateDom() // vue内部的实现，是更新this.name修改带来的数据变更
}
````

所以如果我们希望能打印出最新name，我们需要这样

````js
mounted () {
  this.name = 'chenmingming'
	const nameDom = document.querySelector('.name')
  
  updateDom() // vue内部的实现，是更新this.name修改带来的数据变更
  
  console.log(nameDom.innerText) // 这里可以获取到最新的name
}
````

由于这个`updateDom`是vue内部的执行，我们无法知道，所以vue为我们提供了nextTick让我们知道`updateDom`这个过程的完成。所以我们只需要这样写

````js
async mounted () {
  this.name = 'chenmingming'
	const nameDom = document.querySelector('.name')
  
  await this.nextTick()
  
  console.log(nameDom.innerText) // 这里可以获取到最新的name
}
````

**这就是我们nextTick在项目里的常见用法**

## nextTick如何实现

我们知道了nextTick的作用，那vue内部是如何实现nextTick的呢？我在看源码之后把nextTick整个过程精简为三步：

1. 根据使用场景设置nextTick更新的方式
2. 往任务队列里面插任务
3. 执行并清空任务队列



#### 设置nextTick更新的方式

首先我们看第一步**根据使用场景设置nextTick更新的方式**，我下面先用简单的伪码来描述一下整个过程

````js
let timerFunc // nextTick更新方式

if (支持Promise) {
	将timerFunc设置为Promise方式
} else if (支持MutationObserve) {
	将timerFunc设置为MutationObserve方式
} else if (支持setImmediate) {
	将timerFunc设置为MutationObserve方式
} else {
  将timerFunc设置为setTimeout方式
}
````

实际代码为：

````js
/** 根据环境支持程度timerFunc */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()

  timerFunc = () => {
    p.then(flushCallbacks)

    /** ios UIWebview的一些怪异行为导致Promise.then不能彻底结束，所以此处强加一波宏服务处理 */
    if (isIOS) setTimeout(noop)
  }

  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // 在不支持Promise的时候使用MutationObserver
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver在IE11上不可靠)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })

  timerFunc = () => {
    counter = (counter + 1) % 2 // 0 1
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
````

> 这里除了Promise和setTimeout比较常见，也介绍一下MutationObserver和setImmediate。MutationObserver可以监测dom变化，setImmediate被设计用来处理一些用时很长的任务。
>
> 关于MutationObserver和setImmediate的API详细可见：
> https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
>
> https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setImmediate

#### 任务队列的执行与清空

设置过timerFunc之后，我们看一下具体的nextTick实现

````js
export function nextTick (cb, ctx) {
  let _resolve

  // 添加任务
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (error) {
        handleError(e, ctx, 'nextTick')
      }
    }
  })

  // 执行并清空队列
  if (!pending) {
    pending = true
    timerFunc()
  }

  // 提供Promise形式
  if (!cb && typeof Promise !== 'undefined' && isNative(Promise)) {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
````

可以看到整个逻辑很简单，基本分为添加任务，执行并清空队列，清空队列的方法如下

````js
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0

  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
````

整体逻辑很简单主要就是建立一个任务队列进行执行和清空，这样的好处是把多个使用nextTick的异步任务合并成一个异步任务进行处理。

nextTick总体其实就是**创建一个异步的微服务/宏服务在当前队列的同步任务执行完进行返回**。

