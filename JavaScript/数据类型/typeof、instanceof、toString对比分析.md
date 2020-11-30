# JS类型判断

我们在之前的[JavaScript类型](https://zhuanlan.zhihu.com/p/226345109)中曾经详细的介绍过JavaScript的类型与类型转换，然而在JavaScript中数据类型还有一个点需要了解：**就是如何判断我们当前数据的类型**。本章就是介绍JS判断类型常见的的几种方式。

我们常见的判断类型的方式以下几种

1. typeof
2. instanceof
3. Object.prototype.toString

为什么判断类型会有三种判断方式呢？他们之间有什么不同？接下来我将详解这三种方式的异同和使用场景

## 常见需要判断的类型

我们知道JavaScript有着**Number、String、Boolean、Null、Undefined、Symbol共6种简单类型和Object一种复杂类型**（暂时忽略BigInt）。在我们平时的应用中除了判断这些基础类型和复杂类型，还可能需要判断一些特殊的Object类型（如：Function，Array，Date...）。我们本着能区分这些类型的目的，去应用**typeof、instanceof、Object.prototype.toString**三种方式来看看效果

## typeof

> 语法：typeof operand
>
> 定义：typeof操作符返回一个字符串，表示未经计算的操作数的类型

从定义上来看，typeof应该是进行判断数据类型的。

我们写一个demo进行测试

````js
var fn = function () {}

console.log(typeof undefined) // undefined
console.log(typeof null) // object
console.log(typeof 123) // number
console.log(typeof '123') // string
console.log(typeof true) // boolean
console.log(typeof Symbol(123)) // symbol
console.log(typeof {}) // object
console.log(typeof []) // object
console.log(typeof fn) // function
console.log(typeof new Date(123456)) // object
````

可以发现，大部分类型都是可以进行准确判断的，但是有几个例外我们并不能判断出来

1. **无法判断null**: typeof null => object

2. **无法判断数组**: typeof [] => object

3. **无法判断日期对象**: typeof new Date(123456) => object

可以看的出来，这个`typeof`好像并不能达到我们预期的效果，了解`typeof`之后我们来看一下`instanceof`



## instanceof

> 语法：object（实例） instanceof constructor（构造函数）
>
> 定义：检测 object 的原型链上有没有 constructor.prototype

从语法和定义上来看，我们的`instanceof`操作符是用来判断实例对象的继承关系的。**`instanceof`的结果主要依赖于实例的`[[prototype]]`这个内部属性。**



**我们首先来科普一下`[[prototype]]`到底是什么**，大家知道JS是采用原型模型进行设计的。

我们的对象实例是通过构造函数创建，构造函数有着自己的`prototype`属性，他标识着构造函数的原型。构造函数可以直接通过访问`prototype`属性进行读取，以Vue为例

````js
function Vue () { /** ... */ }

Vue.prototype.init = function () { /** ... */ }

const vm = new Vue

vm instanceof Vue // true
````

可以看到我们的`vm`对象是通过`Vue`构造函数被创建出来，这个`vm`对象中会有一个`[[prototype]]`的内部属性。这个`[[prototype]]`指向的是`Vue.prototype`，如果`vm`的`[[prototype]]`指向`Vue.prototype`则说明`vm`是`Vue`的实例，则`vm instanceof Vue`为true。

`Vue`是一个函数对象，它的原型指向`Function`，`Function`再指向`Object`。所以

````js
Vue instanceof Function // true
Vue instanceof Object // true
````

但是我们的`vm`由于是一个实例对象，所以他的原型链不再指向`Function`而是直接指向`Object`，所以我们可以看到

````js
vm instanceof Vue // true
vm instanceof Function // false
vm instanceof Object // true
````

大家可以根据这个例子体会一下`instanceof`的作用和规则，如果你对原型链的链路不太熟悉，可以看[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)复习一下



通常我们可以通过

1. vm.constructor.prototype
2. Object.getPrototypeOf(vm)

两种方式来访问`vm`的`[[prototype]]`属性。



## Object.prototype.toString

> 使用方法：Object.prototype.toString.call(object)

除了`typeof`，我们还有`Object.prototype.toString`来检查属性的类型。我们之前知道`typeof`返回的无法对特殊对象进行区分，而我们创建的对象（包含特殊对象）会有一个内部的`[[class]]`属性来标明自己的类型。`Object.prototype.toString`就是访问这个内部属性的一个渠道。

> 注意：Object.prototype.toString在ES5之前访问[[class]]，[[class]]是之前版本内置类型的标记，ES5之后[[class]]被替换为[[Symbol.toStringTag]]，这个[[Symbol.toStringTag]]是可以被重写的，所以使用Object.prototype.toString判断类型的时候尽量不要重写[[Symbol.toStringTag]]

我们来试试`Object.prototype.toString`

````js
var fn = function () {}

console.log(Object.prototype.toString.call(undefined)) // [object Undefined]
console.log(Object.prototype.toString.call(null)) // [object Null]
console.log(Object.prototype.toString.call(123)) // [object Number]
console.log(Object.prototype.toString.call('123')) // [object String]
console.log(Object.prototype.toString.call(true)) // [object Boolean]
console.log(Object.prototype.toString.call(Symbol(123))) // [object Symbol]
console.log(Object.prototype.toString.call({})) // [object Object]
console.log(Object.prototype.toString.call([])) // [object Array]
console.log(Object.prototype.toString.call(fn)) // [object Function]
console.log(Object.prototype.toString.call(new Date(123456))) // [object Date]
````

看起来很完美的检查到了所有类型～，实在是一个很好的判断类型的解决方案



## 总结

通过这篇学习，我们了解到了JS常用的判断类型的几种方式，这在我们日常开发过程中是一个常用的知识点，接下来我们来总结一下

1. typeof：【不推荐】返回对象类型。但由于一些历史因素，无法准确判断特殊类型（Null，特殊对象Array...）
2. instanceof：判断对象的继承关系，同时复习了一下原型链。
3. Object.prototype.toString：【推荐】返回对象类型，能够准确的判断对象类型。但是注意在使用过程中尽量不要修改`[[Symbol.toStringTag]]`。关于[[Symbol.toString]]的详细信息可以参考[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag)

