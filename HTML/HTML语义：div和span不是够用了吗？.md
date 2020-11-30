# HTML语义：div和span不是够用了吗？
---
## 标签的语义化
我们通过div和span也可以完成需求，为什么还需要其他标签呢？
- 深刻掌握HTML标签，你就比别人要厉害那么一些
- 语义标签可以清晰看出网页结构
- 语义标签更适宜机器阅读，提升SEO，支持读屏软件

## 使用语义化标签的标准
正确的语义化标签 > div+span > 错误的语义化标签

错误示范1: 所有的并列关系都使用ul标签，事实上ul多数出现在行文中间，代表要列举一些事项。所有并列关系都用ul的话，则会导致造成大量冗余<br>
正确的例子：
````html
<p>I have lived in the following countries:</p>
<ul>
 <li>Norway
 <li>Switzerland
 <li>United Kingdom
 <li>United States
</ul>
````

## 语义类标签作为自然语言的延伸
能够通过html标签就能够读懂你所说的这句话的意义，同样的文字不同的语义可能会导致歧义

例如：<br>
````html
<p>今天我吃了一个苹果</p>
<!-- em标签表示重读 -->
<p><em>今天</em>我吃了一个苹果</p>
<p>今天我吃了<em>一个</em>苹果</p>
````

## 其他标签介绍
ruby：你今天真好(sha)看(bi)
hgroup：标题中包含副标题
结构标签：
- body
- header
- nav：导航
- aside：与文章不太相关的部分，如导航/广告等
- section
- footer
- address：作者联系方式

## 问题
strong与em标签的区别
> strong表示这部分内容重要，em表示重读方便语义的理解