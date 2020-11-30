# JavaScript运行时

当我们写下的JavaScript代码在运行时，JS引擎会解析执行我们所写下的代码，而这些解析执行的过程，我们称作“*运行时*”概念。了解运行时内部的特殊机制可以让我们更好的理解与把控我们的程序执行。

**闭包**和**宏服务与微服务**是运行时中的重要组成部分，我们本章着重介绍这两个概念

## 闭包&执行上下文栈

### 闭包概念

闭包(closure)是一个常见的特性，我们常说的JavaScript闭包，一般指的是`function closure`，也就是我们的函数闭包。

**闭包指的是携带自身执行环境的代码块**。简单来说也就是为了运行我们写下的代码，我们需要一个执行环境来运行他们。这个执行环境也叫做执行上下文

### 执行上下文

上下文栈主要由以下几个部分组成：

- code evaluation state：代码执行位置
- Function：如果是函数内执行
- Script or Module：如果是在Script/Module中执行
- LexicalEnvironment：词法环境
- VariableEnvironment：变量环境（为了处理var声明提升的历史包袱）

其中我们最需要关心的是**LexicalEnvironment：词法环境**，我们来看看词法环境中都有什么

LexicalEnvironment：词法环境

- this
- new.target
- super
- 变量

除了`new.target`是区分我们的函数是否是由`new`运算符调用，`super`是我们的父级标识，`变量`和`this`是我们最常用到的，由于是`this`的取值和修改，更是工作和面试中常用的知识点，所以`this`是如何取值的呢？

### this

在JavaScript内部有一个`[[thisMode]]`来定义我们的this取值，我们的this会根据`[[thisMode]]`的值进行不同的方式获取，`[[thisMode]]`的值和对应取值逻辑如下：

[[thisMode]]

- lexical：上下文中找this（有明确调用对象时采用的模式）
  - 箭头函数：this指向调用方的父级上下文
  - 非箭头函数：this指向调用方上下文
- global：取全局（无明确调用对象时采用的模式）
  - 浏览器环境：this指向window
  - Node环境：this指向global
- strict：严格按照调用传入，会null/undefined（指定严格模式时）

> class默认采用严格模式

当你下次对于this的取值疑惑时，就可以通过对应上面的场景和环境对我们的代码进行分析咯～

如果你想手动的修改this，我们也可以通过下面几个API进行修改

- apply
- call
- bind

## 宏服务与微服务

正常来讲我们的代码都是按照解析顺序：从上而下的进行解析执行，但是总会有一些特例比如`setTimeout`和`Promise`会延迟执行。那么`Promise`和`setTimeout`之间的执行顺序谁先谁后呢？如果说存在多个`Promise`和`setTimeout`，并且其中有嵌套关系的话，我们如何判断执行先后呢？

这里就要引出我们JavaScript中的`宏服务`与`微服务`概念：在宏观上，我们的程序执行过程可以拆解为一个个任务，一般我们把这些任务称为`宏任务(macro task)`。在这些`宏任务`内部还有很多子任务，我们把这些子任务称为`微任务(micro task)`。

我们整个程序执行过程就是：执行第一个宏服务 => 执行第一个宏服务内的同步代码 => 执行第一个宏服务下面的微任务 => 执行第二个宏服务... 这样循环，用图来表示比较直观，像是这样

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gikjwzmpesj30qk0roagm.jpg" alt="image-20200909175856695" style="zoom:50%;" />

当我们新增Promise时，Promise内部的声明会被预先执行，resolve之后的任务会作为微任务被插入到当前宏任务尾部，所以一个Promise会新增一个`微任务`

当我们新增一个setTimeout时，则会创建一个`宏服务`插在整个执行队列之后。



下面我们可以通过代码来实验一下

````js
var a = new Promise(res => {
    console.log(11111)
    res()
})
console.log(22222)
a.then(res => {
    console.log(33333)
})
setTimeout(() => {
    console.log(44444)
})

/*
执行结果：
1111
2222
3333
4444
*/
````

## 总结

本章我们知道了JavaScript运行时的一些原理和机制，让我们再回顾一下重点：

1. 闭包概念
2. 执行上下文中this的指向与[[thisMode]]概念
3. 宏服务与微服务的执行顺序

