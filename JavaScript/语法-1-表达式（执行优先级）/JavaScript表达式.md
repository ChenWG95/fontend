# JavaScript 表达式

在[上一章](https://zhuanlan.zhihu.com/p/218069992)我们了解到了 JavaScript 世界的所有基础元素（InputElement 相关的词法）。但是只是认识他们，并不能发出能量。想要让这些基础元素执行起来，我们需要将他们进行组合，组合成的语句就像是一条基本咒语，可以完成一段最小粒度的执行（基础施法）

## Expression 表达式的组合

那么，什么是表达式呢？最小粒度的表达式叫做`Primary Expression`。就比如我们常见的`直接量Literal`、`变量`、`this`与`()`

我们下面简单的把常用表达式分个类别

### Member Expression：成员访问/属性访问表达式

Member Expression 类主要是进行对象属性/方法的获取，比如

```
a.b
a[b]
super.b
super[b]
```

### New Expression：New 运算符表达式

New Expression 类主要是与 new 运算符相关的操作，比如

```
new Foo
```

### Call Expression：调用访问表达式

Call Expression 类主要是调用相关操作，比如

```
fn()
super()
fn`arguments` // 这也是一种特殊的函数调用方式
```

### Update Expression：更新表达式

Update Expression 类主要是一些自增/自减操作

```
a++
++a
a--
--a
```

### Unary Expression：一元表达式

Unary Expression 属于我们常用的表达式，主要进行一些常规操作/类型转换

```
delete a.b
void a
typeof a
await a
+a
-a
!a
```

### 计算表达式

计算表达式也是我们常用的表达式，其中综合包含了**Additive Expression: 加减法表达式**、**Multiplicative Expression：乘法表达式**、**Exponental Expression：乘方表达式**

```
a+b
a-b
a*b
a/b
a%b
a**b
...
```

> _\*\* 执行优先级高于 常规计算_

### 关系&逻辑表达式

关系&逻辑表达式是我们条件判断中比较常用的表达式，在 JS 中有一些特别的关系运算符（`instance`和`in`）

```
a > b
a >= b
a < b
a <= b
a instanceof b	// 判断a是否为b的实例
a in b	// 判断b中是否含有a属性

a && b
a || b
```

值得一提的是，在 `&&`中，存在短路逻辑（即如果提前命中即不往后执行）比如

```js
true && console.log(1) // 打印1
false && console.log(1) // 不执行
// 在&&操作中，如第一个条件为false，则不往后执行（短路）

true || console.log(1) // 不执行
false || console.log(1) // 打印1
// 在||操作中，如第一个条件为true，则不往后执行（短路）
```

上面只是一些常见的表达式类型，如果你希望对表达式有详细了解，可见[表达式和运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators)

## 常规表达式优先级

学习了这么多表达式，我们会遇到一个问题。假如两个/多个表达式在一起使用，我们应该按照什么样的顺序进行计算呢？

实际上，我们的 JavaScript 世界早已有一个规则将这些表达式的执行优先级进行区分，我们只需要了解这些优先级即可，下面我将一些常见的优先级区分列举一下

```
第一梯队：属性访问，成员变量
第二梯队：new
第三梯队：后置计算
第四梯队：前置计算（一元运算符，typeOf, instanceof, void, await）
```

如果想要查看具体的运算优先级，可参考[运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)

## 赋值表达式优先级

赋值可以说是我们日常代码中最常用的内容了，但是这里也有两个需要注意的点

1. 赋值右结合（右关联）
2. 逗号取值后置逻辑

分别用代码来描述如下：

```js
/* 赋值右结合（右关联）*/
a = b = c = d // 等同于: a = (b = (c = d))

/* 逗号取值后置 */
a = (1, 2, 3) // a: 3
```

## 总结

学习了这一节，我们最掌握了 JS 表达式粒度的执行逻辑。可能你会觉得这么多运算符的优先级难以记忆，我这里交给大家一个小技巧：还记得`()`吗？他的运算符优先级是最高的。所以当你不确定具体的执行逻辑时，你可以通过添加`()`来保障执行顺序
