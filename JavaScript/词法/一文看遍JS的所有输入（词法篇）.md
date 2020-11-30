# 一文看遍 JS 的所有输入（词法篇）

当你敲下第一行 JavaScript 代码时，我们就已经进入了 JavaScript 的世界了。

在 JavaScript 的世界里，这里的一切都是由我们所敲下的每一个字符所决定，我们一般把这些字符称为我们的基础元素，之后一切的规则和联系都是由此产生。古人把我们的宇宙万物划分为是由“金”、“木”、“水”、“火”、“土”5 种基础元素组成。那你知道 JavaScript 的世界是由几种基础元素组成的吗？

## 输入基础元素

同五行划分一样，我们输入 JavaScript 代码中的每个字符，也可以被大体分类。我们把所有的输入统称为`inputElement`，宏观上来看，他们可以被分为这 4 大类

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gifwueua6cj30ly0j679p.jpg" alt="image-20200905173825758" style="zoom: 50%;" />

可以看到，我们的输入元素基本被分为：

- WhiteSpace：空白字符（其中最常见的就是我们敲的`空格`）
- LineTerminator：换行符（我不相信你写代码的时候从来不换行，换行时候用的那个就是了）
- Comment：注释（就是程序员们都想看，但又都不想写的那些东西）
- Token：令牌（Token 其实很难有一个很好的翻译，而且它是一个很泛的概念，之后我会详细的为大家讲解）

## WhiteSpace：空白字符

首先来为大家介绍一下我们的空白字符。空白字符是一个常见且神奇的元素，`tab`、`space`都属于我们常见且常用的空白字符。除了`tab`和`space`，我们还有其他几种空白字符，看看你有没有见过。

- <VT>：纵向 Tab 符
- <FF>：换页符
- <NBSP>：NB 空格
- <ZWNBSP>：ZWNB 空格
- <USP>：其他 Unicode 空白

这里大家可以看到我们熟悉的身影：`<NBSP>`，是否还记得我们的 HTML 的 Entity（Entity 概念也是 HTML 里面鲜为人知的一个概念，之后我会在 HTML 章节细讲\_）里面也有着`&nbsp;`这个东西？

大多数人觉得这只是空格，其实不然！相比于空格`space`，`nbsp`可多了一个`nb`。好了我知道你脑海里面一定会冒出`牛逼空格`这个概念了，不过这个空格确实有它的过人之处。这个过人之处就要从他的名字中的说起，`nb`代表的是`no-break`，也就是说他是不会被打破，其实就是相比于正常空格，`nbsp`是一个不会换行的空格，不信你可以试一下～

然后还有一个比`<NBSP>`名字更长的空格叫做`<ZWNBSP>`空格，这个`<ZWNBSP>`空格是**空格界的黑魔法**，他的全称叫做`zero-width-no-break-space`也就是零宽空格。你可以通过它制造一些令人匪 huai 夷 yi 所 ren 依 sheng 的代码片段，比如：

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gify0nfu7yj304w04idfs.jpg" alt="image-20200905181904782" style="zoom:50%;" />

小伙伴们发现原来还能这样声明变量 a？？？不信邪的小伙伴们纷纷也在下面打出了这一行代码，于是纷纷得到下面的结果

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gify110k1xj30hw05c3ys.jpg" alt="image-20200905181926522" style="zoom:50%;" />

是不是很神奇，看起来一样的代码却产生了不同的结果！其中的原因就是我们前一段代码在`var`与`a`之间插入了一个大家看不见的空白字符`<ZWNBSP>`，这个字符无法直接打出，但是我们可以通过 unicode 码`\uEFEE`进行输入。

**这里友情提示：千万不要在工作中使用`<ZWNBSP>`，否则你的同事应该会把你打个半死..**

## LineTerminator：换行符

换行符这里一般就是指我们的**回车<CR>**··与**换行<LF>**，还有两个不常见的`<PS>`和`<LS>`基本可以忽略。

很多人可能会觉得奇怪，会什么一个换行需要两个字符？我们可以经常看到我们的代码里换行都是`\r\n`这样的写法，这样的原因其实是来自于打字机的换行操作（因为最早的计算机都是类似于打孔机一样的东西）

打字机换行操作是

1. 移到行首

2. 切换到下一行

于是延续至今，我们的计算机也就出现了

1. `\r`移到行首
2. `\n`切换到下一行

## Comment：注释

> 人人都想看注释，人人都不想写注释。 ——鲁迅

说到注释，这可真是任何语言中都必不可缺的东西了。在我们的 JavaScript 中，他当然也占据着举足轻重的地位。它的基础形式也很简单，主要分为以下两类

1. `//`
2. `/* */`

剩下的就是大家在里面的肆 bu 意 ke 创 neng 作 xie 了

## Token：令牌

接下来就是我们的重头戏：**Token**。据不完全统计，我们日常 coding 中的 98%输入字符都属于 Token 范畴，其实 Token 范畴很广，目前也没有一个很好的翻译内容，所以我们就先叫它`令牌`吧，下面先跟大家大体的介绍一下 Token 概念。

Token 主要由以下几部分组成：

- IdentifierName：标识名称
- Punctuators：符号
- Template：模版
- Literal：直接量

### IdentifierName：标识名称

标识名称（_IdentifierName_）其实很好理解，你写的那些变量名、方法名、类名都属于标识名称。除了你起的五花八门的名称，标识名称还包括 JavaScript 的**关键字**和**保留字**，这些名字是不能随便乱用的！总的来说，标识名称包含这些东西

- Keywords：关键字（for，while，var，let，const...）
- Future reserved Keywords：保留字
- Identify：标识（变量名/方法名/类名/... 你自己定义的名称）

如果你想要查询关键字有哪些，可以看[JavaScript Keywords](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords)，保留字基本上现在好像也就一个`enum`所以记住就好啦～

而关于命名规则，你可以查看[文档](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/First_steps/Variables)中**关于变量命名的规则**部分，日常工作中别用乱七八糟的字符就好了

### Punctuators：符号

Punctuators 就是我们各种各样的符号，这里会分为三类，分别为：

- Punctuator：`{()[]....;,<><=>===!====!==+-*%**++--<<>>>>>&|^!~ &&||?:=+=-=*=%=**=<<=>>=>>>=&=|=^==>`（我看吐了
- DivPunctuator：`/`，`/=`
- RightBracePunctuator：`}`

**我们可以看到在众多符号中`/`、`/=`、`}`特别突出的被单独拎了出来**，这是为什么呢？`/`是由于在正则和数字计算时有着不同的意义。而`/=`和`}`也不知道是什么（我猜`}`是由于标识代码块的结束范围和模版中的特殊标识）

**还有一个特殊的字符`"\"`，这个字符在 JavaScript 中是转义符，所以如果你想要打出`"\"`的话，就要写成`"\\"`这种形式**

所以如何区分符号呢？其实也很简单，不是`/`，`/=`，`}`那基础上就是 Punctuator 了！

### Template：模版

模版是一块比较特殊且独立的模块，一行代码概括就是

```
var username = 'chenmingming'
`Hello ${username}!`
```

就是它！

### Literal：直接量

我们上面说了`IdentifierName标识名称`、`Punctuators符号`、`Template模版`大家是不是觉得还缺点什么？

**前面综合起来就好像是`var a = `，但是我们没有内容啊！**我们平常写的`var a = 123`、`var b = 'I am chenmingming'`中的`123`与`I am chenmingming`才是我们 coding 的重要内容，这些内容其实有个名字，叫做**Literal（直接量）**

让我们穷举一下我们都会有哪些直接量：

```
var num1 = 123 			// 十进制数字
var num2 = 0b101		// 二进制数字
var num3 = 0o177		// 八进制数字
var num4 = 0x1ff		// 十六进制数字
var num5 = 1e12			// 科学计数法

var str1 = 'abc'		// 单引号
var str2 = "abc"		// 双引号
var str3 = '\uFEFF'	// \u转义字符
var str4 = '\r'			// 回车
var str5 = '\n'			// 换行

var boo = true			// 布尔类型

var reg = /[0-9]/		// 正则

var spec = null			// Null
```

**我们对以上的直接量进行分类可以分为以下几类：**

- NumberLiteral：数字直接量（包含各种进制的数字 + 科学计数法）
- StringLiteral：字符串直接量（单/双引号正常字符 + 转义字符 + 回车换行）
- NullLiteral：null
- BooleanLiteral：布尔类型直接量
- RegExpression：正则表达式

基本上上面这些就是整个 Token 的全部内容了，可能很多同学会疑惑，为什么没有`undefined`呢？这里也是一个 JavaScript 的设计失误：把`undefined`作为一个变量进行设计，并且还可以赋值！同时也引出了一个最佳实践：**在你想使用`undefined`的时候使用`void 0`进行替代（因为 void 0 总是会返回一个 undefined），这样可以避免`undefined`被赋值而导致的异常行为。**

## \u 转义与 Unicode 编码

InputElement 已经全部介绍完了。我们在上面的**StringLiteral**中发现了这样的一份代码，我们日常也会有看到

```
var str3 = '\uFEFF'	// \u转义字符
```

\u 转义还有一个我们很常见的场景：中文字符输入，比如下面场景

```
var 名字 = 'chenmingming'
// 上下表达的意思一样
var \u540d\u5b57 = 'chenmingming'
```

这两行代码在其他场景都会正常的运行，然后**你会惊喜的发现，我们的中文原来也可以当作变量名啊，那我以后岂不是可以愉快的写下面这种代码？**

```
var 折扣价格 = 折扣计算（商品价格）

if (折扣价格 > 100) {
	console.log('您本次省下了至少100块！')
}
```

理论上确实是可以的，但是为什么没有人这么写呢？这就要涉及到我们 Unicode 码了。

我们在 JS 中输入的每个字符本质上都是 Unicode 码点。我们的 Unicode 的码点展示出来需要**字符集**来解析对应的**码点**，这个字符集有点像我们的字体库，如果字符集（字体库）里面没有我们对应的码点（字体），那么就会解析出一堆乱码，常见的字符集有以下几种

| 字符集名称                          | 范围                                    |
| ----------------------------------- | --------------------------------------- |
| ASCII                               | 基础字符，基本上所有字符集都包含        |
| USC                                 | BMP（0x0000-0xFFFF）范围的 Unicode 字符 |
| GB（GB2312、GBK(GB13000)、GB18030） | GB（国标）：ASCII + 大部分中文          |
| ISO-8859                            | ASCII + 欧洲国家字体                    |
| BIG5                                | ASCII + 繁体字                          |

看到没有，**英文数字之类的都在 ASCII 字符集范围内**所以支持程度也最好，但是你要是用中文，那除了 GB 和 BIG5，其他字符集可看不懂中文，就会乱码了。所以 JavaScript 采用\u 这种形式，标识其对应的 unicode 码点。

那么关于获取一个字符的 unicode 编码呢？这里介绍几个 API

1. `String.charCodeAt()` 和`String.codePointAt()`：获取对应字符的码点
2. `Number.toString([进制数])`：将数字转化为 N 进制
3. `String.fromCharCode()`：查询码点对应的字符

让我们来动手试试看

```js
"陈".charCodeAt(0) // 38472
"陈".charCodeAt(0).toString(16) // "9648" 所以“陈”也可以通过\u9648表示
String.fromCharCode(38472) // "陈"
```

## 结尾

看到这里，我们 JavaScript 中的所有基础元素就介绍完毕了，你会发现所有的输入元素都能在其中找到身影。今后你看 JavaScript 的代码至少每个字符你都认识并知道类别了，那么还有什么能阻挡你阅读任何 JavaScript 代码呢？当然有，那就是 JavaScript 的语法。如果不懂语法就很容易出现我们英语考试时候的尴尬情况：**单词我都看得懂，连在一起就不知道是什么意思了**所以接下来我们会介绍**JavaScript 的语法部分**，敬请期待～
