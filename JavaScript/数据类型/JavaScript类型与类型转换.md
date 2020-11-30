# JavaScript 类型

在[JavaScript 表达式](https://zhuanlan.zhihu.com/p/226089184)章节我们了解到了表达式的概念。我们发现有一些其貌不扬的表达式会产生一些匪夷所思的表现。比如`+[]`这样的表达式结果是`0`，想要知道为什么，那你需要了解一下 JavaScript 的数据类型以及类型转换了。

JavaScript 数据类型也是 JavaScript 世界中的一个重要的组成部分，本章我们将回顾一下 JavaScript 的数据类型，以及把其中比较重点几种类型转换机制详细的剖析一下。

## JavaScript 数据类型

首先我们来回顾一下 JavaScript 的数据类型：

- Number
- String
- Boolean
- Null
- Undefined
- Object
- Symbol

## JavaScript 类型转换

JavaScript 的类型转换用一张图可以概括

![img](https://tva1.sinaimg.cn/large/007S8ZIlgy1gijl5qlzx7j30vb0cfdl3.jpg)

这是 winter 的《重学前端》中的一张图，可以看到除了正常的转换规则。有几个特殊的转换机制被特殊标注，他们分别是**装箱转换**、**拆箱转换**、**StringToNumber**、**NumberToString**，接下来我将一一详细介绍它们

## 装箱转换

装箱转换表示把其他类型转化为 Object 类型，常见的装箱操作有以下几种方式

```
// 注意Number，Boolean和String需要添加new运算符，否则是转化成对应类型
new Number()
new String()
new Boolean()

Symbol()
Object()
```

## 拆箱转换

拆箱操作和装箱操作反之，就是把 Object 类型对象转化为其他类型（Number/String），拆箱操作的核心是调用`toPrimitive`。`toPrimitive`简单来讲可以分为以下两步：

1. valueOf()
2. toString()

默认来讲一般都会按照

1. valueOf
2. toString

的顺序进行执行。**这里有个例外，就是 Date 类型是先调用.toString，然后调用.valueOf**。当然这些行为都是基于默认行为，你可以通过设置`[Symbol.toPrimitive]`自定义拆箱行为。

还记得我们开头提问的`+[]`为什么等于`0`吗？原因就是由于`[]`经历了拆箱操作，`[].valueOf().toString()`之后得到空字符串，而`+空字符串`根据上面的类型转换自然就变成 0 了。

> 关于拆箱转换，我之前的文章[【JS 基础】隐式转换（二）](https://zhuanlan.zhihu.com/p/73424909)也有提到过，想要了解更多细节的小伙伴可以看看

## StringToNumber

说到 StringToNumber，我们就要先理清楚 Number 有几种类型。从之前的[一文看遍 JS 的所有输入（词法篇）](https://zhuanlan.zhihu.com/p/218069992)我们可以了解到 NumberLiteral 有这么几种类型：

- 十进制
  - 正常
  - 科学计数法 e
- 二进制
- 八进制
- 十六进制

所以，要实现 StringToNumber，我们就要根据不同的 Number 输入进行识别，最终统一转化为十进制。

**这里有几个需要思考的关键点**：

1. 如何识别 Number 的类型？
2. 如何把一个字符串'123'解析为数字 123？
3. 2 中假如遇到十六进制的'abcdef'这种情况怎么办？

第一个问题**如何识别 Number 的类型？**我们可以通过正则表达式的解析方式进行识别\*\*。

第二个问题**如何把一个字符串'123'解析为数字 123？**这里我们可以用`123 = 1*10**2 + 2*10**1 + 3*10**0`这种思路处理。

第三个问题**遇到十六进制的'abcdef'**如何识别？这里我们需要把字符转化成码点，通过以 f 的码点减去十六进制数的码点得到对应的真实值

根据上述的三种关键思路，我们可以得到一个[StringToNumber 函数](https://github.com/ChenWG95/blog/blob/master/JavaScript/week3/StringToNumber.js)

## NumberToString

NumberToString 相比于 StringToNumber 会简单一些，类似于实现 toString(raidx)方法。这里主要需要了解的知识点是：**如何把十进制的值二进制/八进制/十六进制**。这里需要一些进制转换的规则：

1. 整数十进制转化为 N 进制时，除 N 取余，当余数<N 时，最终结果逆序排列即可

2. 小数十进制转化为 N 进制时，乘 N 取整，当乘积为整数时，最终结果正序排列即可（可能存在无限循环的情况，所以最好设定一个最大宽度）

根据以上思路，我们可以得到一个[NumberToString 函数](https://github.com/ChenWG95/blog/blob/master/JavaScript/week3/NumberToString.js)

## 总结

本章我们主要了解了 JS 中的类型与类型转换的规则，简单介绍了**装箱转换**、**拆箱转换**、**StringToNumber**、**NumberToString**四种转化规则的关键思路。掌握了类型转化的机制，你就可以理解在表达式中存在的一些奇特现象。

