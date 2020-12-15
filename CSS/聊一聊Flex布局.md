# 聊一聊Flex布局

Flex布局目前对于前端来说已经是一个非常熟悉且常用的布局方案了。有了它，我们很大程度上就可以避免原来让人头秃的正常流布局带来的很多IFC（inline-formatting-context）问题。随着浏览器的支持性不断增强，基本上我们日常的业务开发中95%以上的布局都可以通过Flex轻松解决。

但是最近团队面试过程中，我却发现大部分同学对于Flex的理解并没有想象中的那么清晰深入，大部分都只是停留在会用一些基础布局的阶段。今天刚好在梳理CSS这块的知识体系，所以我就把这块重要的Flex布局再和大家深入浅出的重温一下。

## Flex布局的原理

Flex布局的方式，其实一句话说明就是：**通过主轴和交叉轴两条轴上的排布方式来控制布局**。

![image-20201121005445875](https://tva1.sinaimg.cn/large/0081Kckwgy1gkw4jsipqxj30s00ba750.jpg)

如图所示，**我们通过设置主轴和交叉轴两个方向的排布方式进行组合，即可以完成各种各样的布局**。



## justify-content

**我们可以通过`justify-content`属性设置主轴的排布方式**，他有以下几种排列方式：

- flex-start
- flex-end
- center
- space-around
- space-between
- space-evenly

借用阮一峰老师的图来形象的描述一下每一种布局

![img](https://tva1.sinaimg.cn/large/0081Kckwgy1gkw3ry2fx7j30hp0l70sn.jpg)

图中少了一个`space-evenly`，其实就是flex-item之间每个间隔都一样的布局。

**我们这里主要探讨一下`space-between`、`space-around`和`space-evenly`的区别。**



首先，无论是`space-between`、`space-around`还是`space-evenly`，**他们的相邻两个item的间距总是一致的，唯一的不同点是首尾两个元素是如何对齐的**。用一个形象的图片可以描述他们之间的差异。



### space-between

![image-20201121003745768](https://tva1.sinaimg.cn/large/0081Kckwgy1gkw423c7tpj30rw0b6q33.jpg)

space-between的排列方式首尾对齐，这也就意味着这个行的布局计算方式是：

**行总宽度 = item的宽度 + 1间距 +  item的宽度 + 1间距 +  item的宽度**

浏览器就会根据上面的公式

1. 行总宽减去各个item的宽度
2. 将剩余宽度平分赋值给间距

之后布局都是按照这种模式来计算，下面的我就直接列公式了，大家知道这个原理就好。



### space-around

![image-20201121004511918](https://tva1.sinaimg.cn/large/0081Kckwgy1gkw49tvod1j30ry0b6q39.jpg)

space-around的排列方式是首尾各留一半间距，它的行计算方式是：

**行总宽度 = 0.5间距 + item的宽度 + 1间距 +  item的宽度 + 1间距 +  item的宽度 + 0.5间距**

同样的，浏览器就会根据上面的公式

1. 行总宽减去各个item的宽度
2. 将剩余宽度按照比例赋值给间距



### space-evenly

![image-20201121004818740](https://tva1.sinaimg.cn/large/0081Kckwgy1gkw4d2t7tdj30ry0b4t8v.jpg)

space-evenly的排列方式是首位各留1间距，它的行计算方式是：

**行总宽度 = 1间距 + item的宽度 + 1间距 +  item的宽度 + 1间距 +  item的宽度 + 1间距**

和上面一样的，浏览器就会根据上面的公式

1. 行总宽减去各个item的宽度
2. 将剩余宽度按照比例赋值给间距



## align-items

相比于主轴，我们交叉轴的排列方式就要简单许多，交叉轴可以通过`align-items`属性来进行控制，我们来看看`align-items`都有哪些排列方式

- stretch
- start
- end
- center
- baseline

除了`stretch`是将元素的交叉轴上高度/宽度拉伸到与容器的高度/宽度，baseline是以文本基线对齐，其他的分别是顶头、顶尾和**居中**，大家最常用的也就是居中了

> 通过flex布局我们可以轻松的解决以往正常流垂直居中的难题

同样是借鉴阮老师的图

![img](https://tva1.sinaimg.cn/large/0081Kckwgy1gkw5urqxv0j30h50lu3yg.jpg)

大家可以通过[mdn的例子](https://developer.mozilla.org/zh-CN/docs/Web/CSS/align-items)查看每种布局的效果



## align-self

我们刚刚说了`justify-content`和`align-items`，大家可能会发现这样的排布无论是主轴还是交叉轴，他们内部每个item元素的在这个轴上的排列方式都是一致的。**那我们如果需要单独定制**要怎么办呢？

**首先主轴，不行**，因为主轴的对齐方式大家可以看到是根据行整体来进行分配的，并不能单独定制（试想一下一个space-around里面有一个flex-start怎么计算？不仅你蒙，浏览器也蒙）

**但是交叉轴就不一样了，我们之前说的`align-items`其实本质上是为交叉轴上的每个元素赋予一个统一的对齐方式，但是元素可以通过`align-self`自己进行单独定制**。它的值和`align-items`基本一致，大家知道这个概念就好了。



## align-content

我**们刚才了解到了`align-items`和`align-self`，我们会发现为什么`align-items`会比`justify-content`少了诸如`space-around`、`space-between`、`space-evenly`这种属性呢？**

原因其实是**之前我们都是一行多列的布局，并且由于主轴与交叉轴的默认是行与列，所以我们并没有出现多列的场景**。其实细心的同学可以发现我们的flex布局基本上可以分为三类

- xxx-content：可应用在多行/多列时的规则，可以进行更加灵活的布局。
- xxx-items: 可应用在一般单行/单列时的规则，虽然也可以用在多行/多列场景下，但是排版方式较为单一（因为单行/单列也用不到content拓展的那些排列方式
- xxx-self: 可应用在单个元素上的排列方式



**所以按照这个理解，当出现多行场景时`flex-wrap: wrap`，我们想对于交叉轴做一些类似于`justify-content`对主轴做的一些操作时，就可以通过设置`align-content`来进行布局了**，其值可以参考`justify-content`

**然而在flex布局中并没有`justify-items`和`justify-self`** ，其原因是在flex布局中的主轴上，flex将我们的内容作为一个组进行处理。justify-content用于将剩余空间对于组中每一个元素进行分配。

举个例子：justify-content: flex-end将剩余空间放在子元素前，justify-content: space-around将剩余空间放在子元素两边

但是由于是以整个组来进行分配，所以无法进行单独指定。而align-items可能有额外空间供元素单独移动。

所以总结下来：flex布局的主副轴有

主轴：
- justify-content
副轴：
- align-items
- align-self
- align-content

## place

我们根据前面学习了解到了`justify-content`和`align-items`分别设置主轴与交叉轴。**其实当我们同时设置`justify`和`align`时，还可以用一个简写属性`place`**

````css
{
  // 等同于justify-content: center和align-items: flex-start
  place-content: center flex-start;
  // 等同于justify-items: center和align-items: flex-start
  place-items: center flex-start;
  // 等同于justify-self: center和align-items: flex-start
  place-self: center flex-start;
}
````



## flex

在弹性布局中，我们基本上就两点：**布局**与**弹性**。我们之前说的都属于布局篇章的内容，接下来我们就重点讲讲弹性部分。这部分也是我发现大家都大致用过，但是又不了解细节的部分。

我们的Flex布局的Flex，意思就是收缩。**这也是Flex布局的一大特点，你无需设定具体的宽度，只需要设定比例容器就可以自由的进行伸缩**。我们常常使用`flex`属性来定义对应的比例，所以我们接下来就剖析一下`flex`属性



flex由三部分组成

- flex-grow：容器的拉伸规则

- flex-shrink：容器的收缩规则

- flex-basis：容器基础尺寸



### flex-grow

`flex-grow`指的是当剩余空间充足时，各容器的拉伸部分内容分配，我们找几个盒子100px*100px的盒子放入一个500px宽的容器中

![image-20201121172926101](https://tva1.sinaimg.cn/large/0081Kckwgy1gkwxaqhzcej30rs0b8weu.jpg)

可以看到三个100px的盒子是无法撑满一个500px的容器的，我们可以设置`flex-grow`属性来设定让他们分配剩余空间撑满盒子

![image-20201121173126007](https://tva1.sinaimg.cn/large/0081Kckwgy1gkwxctpd1zj30ry0badgc.jpg)

我们分别设置了`flex-grow`的属性为1、2、1，可以看到原本100px宽的盒子分别被撑为了150px、200px、150px。



有人可能会问，150:200:150不是3:4:3吗，怎么不是我们设置的1:2:1呢？

原因是因为**`flex-grow`分配的是剩余空间**，在这个例子中，由于我们的三个盒子都是宽100px，所以剩余空间就只剩下500 - 100 * 3 = 200px。我们按照指定的`flex-grow`分配这200px的结果是50px、100px、50px，最终将分配的剩余宽度加上原始宽度100px，就变成150px、200px和150px了



> flex-grow默认值为0，也就是说默认的元素不会根据剩余空间进行拉伸。



### flex-shrink

`flex-grow`是拉伸，与之对应的还有一个是收缩。`flex-shrink`就是负责收缩比例的。当无剩余空间同时放置各容器时，各容器的收缩规则就是由`flex-shrink`来进行定义的。

同样是刚才的三个盒子，我们现在把他们都变成200px的宽度。这样的话三个200px的盒子是无法放在一个500px的容器内的。

![image-20201121174021211](https://tva1.sinaimg.cn/large/0081Kckwgy1gkwxm3s7hyj30xg0b8mxl.jpg)

> 由于flex-shrink的默认值是1会自动收缩，所以为了展示放不下的效果，图中我们将flex-shrink设为0禁止收缩

这时我们可以设置`flex-shrink`属性，让他们根据比例进行收缩，同样设置为1:2:1的比例

![image-20201121174700431](https://tva1.sinaimg.cn/large/0081Kckwgy1gkwxt0m37pj30ry0bat97.jpg)

和`flex-grow`一样，**`flex-shrink`也是分配超出的部分的缩减值**。

在我们这个例子中，三个200px的盒子宽为600px超出了500px容器100px的宽度。所以我们的`flex-shrink`就是按照比例来分配这100px宽度的。由于我们设置的`flex-shrink`属性为1:2:1，所以对应的我们缩放的尺寸就是25px、50px、25px，由于原盒子宽200px，最终我们的盒子宽为175px（200px - 25px）、150px（200px - 50px）、175px（200px - 25px）



当我们使用Flex布局并且把`flex-shrink`设置为0时，就可以轻松完成根据内部元素宽度排列一排的布局了，开源组件`vue-awesome-swiper`中就是使用的这种方式。



### flex-basis

`flex-basis`指的是我们容器的基础尺寸，也就是在主轴上元素的初始值。值得一提的是它和`width`属性有着类似的作用，但是优先级却要高于`width`。



### flex

在实际项目中，我们一般都会使用`flex`属性这种简写的方式来代替单独声明`flex-grow`、`flex-shrink`和`flex-basis`。但是使用的时候还是有地方要注意的，比如说，当你设置`flex: 1`时，你知道代表的是什么吗？

flex可以指定三个值，但是有不同的赋值规则。**当你设置`flex:1`时，其实代表的是`flex-grow:1`，而不是我们一般直觉中的同时设置`flex-grow`、`flex-shrink`和`flex-basis`三个值，所以`flex-shrink`与`flex-basis`其实还是默认的1和0**。

虽然flex的赋值规则比较复杂，但总的来说**会根据指定数值是否有单位进行区分是`flex-grow`、`flex-shrink`还是`flex-basis`。`flex-grow`的指定永远在`flex-shrink`之前。**如果你想查看具体细节可以参考[这里](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex)



值得一提的是当flex只有一个值赋值是会存在几个特殊的值：`none`、`auto`和`initial`

其中

````css
flex: none // 等同于 flex: 0 0 auto
flex: auto // 等同于 flex: 1 1 auto
flex: initial // 等同于 flex: 0 1 auto
````



最后还有一点要说明的是，以上说的flex规则都是主轴部分的空间分配，当然你也可以通过`flex-direction: column`修改主轴。



基本上Flex布局部分的内容就在这里了，掌握了这些相信你可以轻松的应对大多数的布局问题了～