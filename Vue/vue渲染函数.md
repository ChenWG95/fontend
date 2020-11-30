# Vue Render

## 渲染函数是什么
渲染函数就是进行渲染的函数，我们使用Vue的template的时候我们会这样写
````javascript
<template>
  <div>
  </div>
</template>
````

那么我们写的template就是直接映射在页面的HTML上吗？当然不是，我们的Vue会把这些template进行解析，解析后通过render函数处理为虚拟DOM之后再渲染成真实DOM。由此可以看出：我们的渲染函数其实就是用来输出虚拟DOM的。

那我们就先来介绍一下虚拟DOM

## 虚拟DOM
### 先说下什么是虚拟DOM
虚拟DOM简单理解为是通过JS变量的形式对于我们真实的DOM进行代替。一个是通过变量形式存在JS里的虚拟DOM，一个是存在于浏览器里的真实DOM，但是两个都是一一对应的，不会缺一个少一个。

### 为什么要用虚拟DOM替代真实的DOM呢
因为浏览器中的真实DOM实际的是C++代码实现的，DOM节点你可以console打印看一下其实很复杂。

虽然浏览器给了提供了一些API让我们可以通过JS API来操作DOM，但是这种成本很大：一方面是由于DOM本身就很复杂，另一方面是由于本身就是通过JS调用C++代码也有开销。

针对这种直接操作DOM开销很大的问题，我们想了个办法：尽量少的直接对真实的DOM进行操作，就使用js变量的形式来模拟，加一个减一个都通过js变量来存储记录，最终把结果在渲染为浏览器上的真实DOM。

这也就是为什么我们需要虚拟DOM这个东西

### 正式开始渲染函数
ok，铺垫了这么多背景我们开始正式的介绍一下渲染函数，这个函数只需要传入一个创建虚拟dom的方法作为参数，像是这样
````javascript
render(createElement) {
  return createElement()
}
````

但是createElement真的很长，所以我们一般简称为: h，（别问为什么，问就是好输入

然后这个createElement怎么调用呢？我们有这样的约定（没错，就是约定

render函数接收三个参数
- 节点名称
- (选填)数据对象，React是直接作为props对象，但是Vue对下面进行了细分，来区分props, attr, DOM的props，这也是为什么可以写数组类型的class
- 子节点（如果用字符串会被自动转化为文本节点）

举例说明一下：
````javascript
render (h) {
  return h('div', 'some text')
}

render (h) {
  return h('div', { class: 'xxx' }, [])
}

render (h) {
  return h('div', {}, [
    'hello world',
    h('span', 'bar', [])
  ])
}
````
