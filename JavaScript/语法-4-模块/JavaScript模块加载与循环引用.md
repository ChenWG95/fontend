# Module加载机制

在JavaScript中，模块分为几类

- script module
- script
- 函数体：例如setTimeout

其中module的加载分为commonJs与es两种，两种的加载机制各不相同。加载机制的不同会让他们在一些场景下面的表现并不一致，由于module在我们的项目中应用十分广泛，所以为了更好的使用Module和排查问题，了解他们的加载机制十分重要。今天我们就来探究一下他们各自的加载机制。



本篇将从以下几个方面来介绍Module加载机制

- 浏览器中的module加载
- NodeJS中的module加载
- commonJs与es加载的介绍与区别
- 循环引用



## 浏览器中的module加载

当浏览器中我们需要加载js代码时，我们通常都会使用`<script>`标签来进行引用。

`script标签`根据模块类型可以分为**常规脚本加载**与**ES模块加载**两种

````html
<!-- 脚本加载 -->
<script src="xxx.js"></script>
<script>console.log('111')</scripts>
<!-- ES模块加载 -->
<script src="xxx.js" type="module"></script>
<script>
import { name } from './person.js'
console.log('Hi', name)
</script>
````

可以看到模块加载相比于脚本加载多指定了`type="module"`的属性，加上这个属性后我们就可以使用`es module`的相关特性了，比如`import`、` export`。



**注意**：

1. `type="module"`模式下，this并非指向undefined
2. `type="module"`模式下
3. module加载多次只执行1次
4. 自动使用'use strict'



`script标签`根据加载顺序可以分为**常规加载**、**async加载**和**defer加载**

其中**常规加载过程是：中断网页渲染 => 下载 => 解析 => 执行 => 网页继续渲染，要注意的是这个执行过程中会中断网页的渲染**

````html
<!-- 常规加载 -->
<script src="xxx.js"></script>
````

> 中断渲染原因：因为JS代码可能导致DOM的变化影响重排/重绘会影响页面渲染性能，所以为了性能原因浏览器会先下载解析执行JS代码，之后再继续渲染页面）

由于常规加载可能导致渲染中断，比较理想的方式是**等页面渲染完，我们再下载和加载执行JS代码，这就是defer加载方式**

**defer加载过程是：下载 => 等网页渲染结束 => 解析 => 执行**

````html
<!-- defer加载 -->
<script src="xxx.js" defer></script>
````

但是有些代码我们可能希望先下载，下载完之后立即执行，这时我们使用**async加载方式**。

**async加载过程是：下载 => 下载完 => 中断网页渲染 => 解析 => 执行 => 网页继续渲染**



**注意：**

1. 由于es module的加载机制，type="module"的模块会默认使用defer加载方式

2. script存在src属性才能使用defer和async

## NodeJS中的module加载

当我们在NodeJS中加载一个模块时，我们通常会这样做

````js
const moduleA = require('moduleA')
````

这背后NodeJS是如何加载的呢？

> TIPS: 当Node版本 > 13.2时，我们可以使用es module的import export而不只是commonjs的require module.exports形式



当require的是一个文件时没什么好说的，就是直接引入文件。但是当require引用的是一个文件夹/一个包时，那就会有区别了，这里我们需要首先看一下`package.json`文件



`package.json`中决定require具体从哪个文件作为入口文件进行引入的字段主要有两个: `main`和`exports`。



package的main或者exports

### main

我们一般通过`main`来指定程序的入口，像下面这样

````js
// package.json
{
  "main": "./index.js" // 以当前目录下的index.js作为程序入口
}
````

### exports

除了`main`，我们还可以使用`exports`字段，`exports`字段主要是分模块进行入口加载的。它比`main`的优先级更高，相比之下也可以更加灵活，下面我们看一下`exports`的使用方式



**基本使用**

````js
// testModule package.json
{
  "exports": {
    ".": "./index.js" // 与上面一致，以当前目录下的index.js作为程序入口，"."代表模块主入口
  }
}

// 上面可以简写为
{
  "exports": "./index.js" // 此时优先级高于main
}
````



**按照子目录模块区分**

之前的版本我们都是引入一个整包，通过`exports`我们还可以进行更加细粒度的区分

````js
// testModule package.json
{
  "exports": {
    ".": "./index.js",
    "./moudleA": "./src/modules/moduleA/index.js" // 与上面一致，以当前目录下的index.js作为程序入口，"."代表模块主入口
  }
}

// 使用场景
const moduleA = require('testModule/moduleA') // testModule/src/modules/moduleA/index.js
````



**版本分区**

由于Node版本 > 12时才可使用exports，所以我们还可以拿它来做版本区分

````js
// testModule package.json
{
  "exports": {
    ".": {
      "default": "./main.js", // 其他情况（支持es moudle的新版本）
      "require": "./main.cjs" // commonJS入口
    }
  }
}
````

## commonJS与es加载的区别与介绍

我们之前看到了在不同环境module的对应用法，那么commonJS和es module的加载有什么区别呢？

最重要的区别是：**commonJS输出的是值的拷贝，而es module输出的是值的引用**



这会有什么影响呢？比如说我们现在有一个模块A，里面暴露出一些属性和方法

````js
/** lib.js */
var count = 3
function incCount() {
  count++
}

/** 这样不会变 */
module.exports = {
  count,
  incCount,
}
````

我们希望暴露出去一个count，在调用incCounter之后count值+1，于是我们在项目中引用了

````js
var lib = require('./lib.js')

console.log(lib.count) // 3
lib.incCount()
console.log(lib.count) // 还是3
````

我们发现在调用`incCount`之后，我们预期的`count`值并没有改变，这就是由于**commonjs模块输出的是值的拷贝**，所以当使用commonjs模块时，我们需要这样写

````js
module.exports = {
  get count () { // 这样之后当我们调用count时实际上是调用count方法返回实时的count值
    return count
  },
  incCount
}
````

而如果我们使用es module，就不会有这种问题了，因为**es module输出的是对应内容的只读引用，也就是读的时候再去执行返回**，所以我们用es module重写这个例子就是这样的

````js
// module.js
let count = 3
function incCount() {
  count++
}

export {
  count,
  incCount
}

// main.js
import { count, incCount } from './module.js'

console.log(count) // 3
incCount()
console.log(count) // 4
````

除了上面的区别，还要注意的是使用es module时，这些对象统统都是没有的

- `arguments`
- `require`
- `module`
- `exports`
- `__filename`
- `__dirname`

## 循环引用

由上面我们知道了commonJs与es的module加载机制的不同。那么接下来就利用刚才所学来分析一下我们大型项目中的经典问题——“循环引用”

“循环引用”指的是在我们的大项目里，很容易出现A模块依赖B模块，B模块又同时依赖A模块的情况。就像是下面这样

````js
// b.js
import a from './a.js'

console.log(a)

// a.js
import b from './b.js'

console.log(b)
````

当遇到这种问题时，我们不同的加载方式是如何处理的呢？



首先看看commonjs

````js
// a.js
console.log('a.js load')
module.exports.done = false
const b = require('./b.js')
console.log('b的完成情况', b.done)
module.exports.done = true

// b.js
console.log('b.js load')
module.exports.done = false
const a = require('./a.js')
console.log('a的完成情况', a.done)
module.exports.done = true

// 以a.js为入口执行一下
node a.js
// a.js load
// b.js load
// a的完成情况 false
// b的完成情况 true
````

可以看到从输出来看，整个执行顺序是:

1. a.js设置a.done为false，引用b.js
2. b.js设置b.done为false，引用a.js，此时直接输出a.done的值是false（如何a.done之前没有设置会输出undefined并抛warning）
3. 然后b.js设置b.done为true，返回到a.js
4. 最后a.js设置a.done为true

整个流程没有中断，并且都打印出了值。**可以看到由于commonjs module导出的是值拷贝的原因，所以循环引用并不会造成我们想象中的执行循环。而是使用了引用之前暴露出来的值**。



接下来我们来看一下es的循环引用，由于es的加载机制为只读引用，所以我们换一个例子

````js
// a.js
import {bar} from './b.js';
console.log('a.js');
console.log(bar);
export let foo = 'foo';

// b.js
import {foo} from './a.js';
console.log('b.js');
console.log(foo);
export let bar = 'bar';

// 以a.js为入口执行一下
node a.js
// b.js
// ReferenceError: Cannot access 'foo' before initialization
````

这个时候执行的顺序是这样的：

1. 执行a.js，此时发现a.js引用的b.js，于是执行b.js
2. 执行b.js时，已知a.js导出了foo，所以往下执行console.log('b.js')
3. 再往下执行时发现foo并未定义，于是抛错



那么如何防止这种问题呢？我们可以通过导出函数的形式。

因为函数存在函数提升，所以当我们导出函数时，由于函数提升，其实就可以调用的到，同样的代码我们稍微改写一下

````js
// a.js
import {bar} from './b.js'
console.log('a.js')
console.log(bar)
export let foo = 'foo'

// b.js
import {foo} from './a.js'
console.log('b.js')
console.log(foo)
export let bar = 'bar'

// 以a.js为入口执行一下
node a.js

// b.js
// [Function: foo]
// a.js
// [Function: bar]
````

这样我们就可以正常的调用执行了

## 总结

回顾一下，首先我们了解了script引入的方式，按照模块类型可以分为

- 常规脚本加载
- `type="module"`模块加载

按照加载类型可以分为

- 常规加载
- async加载
- defer加载

然后了解到commonJs的模块引入中，package.json的`main`和`exports`的异同，最后分析了commonJs与es在遇到循环引用时是如何执行的，由此完善了javascript顶层语法中module部分的知识体系。

