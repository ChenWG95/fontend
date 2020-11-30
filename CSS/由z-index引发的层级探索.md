# 由z-index引发的层级探索

`z-index`在日常的开发中是一个十分常用的css属性，`z-index`主要用于定位元素展示的层级。

但是当你深入使用的时候可能就会发现一些看似“魔法”的事情发生，接下来就来带大家看一看这些“魔法效果”

### 看似正常的元素层级

我们现在有parent和child两个元素

````html
<div class="parent">
  <div class="child">
  </div>
</div>
````

加一些css样式加以区分

````css
.parent {
  position: relative;
  width: 200px;
  height: 200px;
  color: #fff;
  background-color: black;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  color: #000;
  transform: translate(-50%, -50%);
  background-color: skyblue;
}
````

最终展示为这样：

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gh93sd8be4j30b20b2gll.jpg" alt="image-20200730144538363" style="zoom:25%;" />

我们知道正常的层级child元素是在parent元素之上的，我们现在希望👆上面代码块的child元素被盖在parent元素下面。

我们可以通过设置child的css属性`z-index: -1`达到效果。

````css
.child {
  z-index: -1;
}
````



<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gh93sltqucj30b00b20sn.jpg" alt="image-20200730144701180" style="zoom:25%;" />

这样我们的child元素就成功跑到下面去了

### “魔法”的开始

现在我们由于一些展示原因，需要将parent元素设置一个`z-index`层级，我们把他设置为2

````css
.parent {
  z-index: 2;
}
````

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gh93soenjdj30aw0b0aa1.jpg" alt="image-20200730145238408" style="zoom:25%;" />

???神奇的事情出现了，我们设置了只设置了parent元素的`z-index`值，但是原来的child元素却又跑到上面了。



这里我们首先要知道**元素的层级展示顺序是怎么样的？**

### 元素层叠规则

我们页面中展示的元素层级顺序其实是**层叠上下文的展示绘制顺序**来决定的，而具体的顺序就是由**层叠上下文**和**层叠水平**决定。接下来详细的解释一下**层叠上下文**与**层叠水平**概念



##### 层叠上下文

**层叠上下文（stacking context）**可以理解为是一个“层的位面“，每个位面里面的元素会根据**层叠水平**进行排序展示。元素可以拥有自己独立的层叠上下文，且**拥有这些自己的层叠上下文的元素会比同级的其他元素要更高**



##### 层叠水平

**层叠水平（stacking level）**可以理解为是一个层级的排序编号，它可以决定元素在**层叠上下文**中的展示顺序，`z-index`、`position`..都会影响到元素的层叠水平



我们整体的排序规则用一个图可以很好的展示

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gh93t0awvhj30u00j4wfl.jpg" alt="image-20200730155717951" style="zoom:50%;" />

从上述规则来看，我们的`parent元素`在加`z-index`之前是符合规则的，那为什么加了`z-index`之后就不符合规则了呢？

### 特殊的z-index

为什么z-index会有这种奇特的表现，经过查阅[CSS的规范](https://www.w3.org/TR/CSS2/visuren.html#z-index)我们可以发现一些可能的细节

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gh93t0ngw8j30s40iw770.jpg" alt="image-20200730150717903" style="zoom:25%;" />

这里我们发现对于定位的盒子元素，`z-index`属性有着特殊的含义：

1. 定义针对与当前层叠上下文的层叠水平

2. 该盒子元素是否创建一个层叠上下文

可以看到**对于position定位元素，我们的`z-index`属性会创建一个层叠上下文**。



### 破解“魔法”

还记得我们之前说的吗？

> 元素可以拥有自己独立的层叠上下文，且**拥有这些自己的层叠上下文的元素会比同级的其他元素要更高**



这就是原因所在了，是因为我们的parent元素存在`position`定位属性，并且设置了z-index，所以他自己创建了一个层叠上下文。child元素则在他的层叠上下文中进行层级比较，对应到图中则为

<img src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gh93t56lxoj30uy0jq75w.jpg" alt="image-20200730162138562" style="zoom:50%;" />

可以看到，这就是为什么parent背景色会在后面被盖住了。



同样的，按照规则：

如果把parent和child设置的一样大，且parent设置inline元素，child的`z-index`为负。

则会存在parent背景色在最下面，上面是child元素，最上面是parent文本这样的神奇现象了，赶快来试试吧~