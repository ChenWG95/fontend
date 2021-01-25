# Vue组件更新

我们之前有探讨过Vue的[数据响应原理](https://zhuanlan.zhihu.com/p/271383465)与[nextTick的实现机制](https://zhuanlan.zhihu.com/p/276295139)，除了这两项Vue还有一个很重要的知识点：就是**组件更新**。我们之前学习数据响应原理的时候曾经了解到我们的数据变化是可以被监听到的，在数据变更后，Vue会进行对应的组件更新。今天我们就来解答在Vue中组件是如何进行更新的。

组件更新主要包含两个部分：**虚拟DOM（Virtual DOM）**和**diff算法**，接下来我们就分别来分析一下

## 虚拟DOM

要介绍虚拟DOM我们首先需要知道**为什么使用虚拟DOM，而不是使用真是DOM？**

其中的一个原因是因为真实的DOM是一个十分复杂的浏览器对象，大家可以通过`console.dir`打印一个DOM来查看，所以**直接操作DOM的成本是很高的**，于是我们通过虚拟DOM的形式来操作，把最终的视图结果再通过真实DOM来进行渲染。

还有一个原因是因为使用虚拟DOM可以让Vue框架**在多平台上进行运行**，因为如果是直接操作浏览器的真实DOM，那么我们就无法在其他平台（比如：Weex）上面使用DOM，所以说虚拟DOM其实也是赋予了我们一个脱离环境依赖的视图表现。

说了这么多，到底什么才是虚拟DOM呢？其实本质上就是JS对象罢了，我们举个简单的例子

````js
/** 这是一个极简的虚拟DOM */
const vnode = {
  tag: 'div',
  attr: {class: 'box'},
  children: [{tag: 'span', attr: {class: 'content'}, children: [1]}]
}
````

````html
<!-- 这是真实DOM -->
<div class="box">
  <span>1</span>
</div>
````

## 组件更新

了解了虚拟DOM的概念，我们可以知道Vue的最终渲染都是通过虚拟DOM渲染的真实DOM。那么当数据改变时，Vue是如何通过虚拟DOM最终更新渲染成真实的DOM呢？这里Vue又做了哪些优化呢？这就要介绍一下我们的组件更新了

组件更新主要指的是：**当我们的数据变更造成虚拟DOM更改时，如何计算这其中的变更从而进行高效更新**

### sameVNode

**组件更新的第一步Vue会进行通过sameVNode对老VNode和新Vnode进行对比**，此时有两种情况：

1. 如果判断是sameVNode则会进行updateVNode（diff算法）
2. 如果判断不是sameVNode则不会进行diff判断，直接通过 **创建新节点 => 更新父元素中的节点 => 删除老节点** 的方式进行更新

那么如何判断是否是sameVNode呢？我们可以看一下精简版的源码

````js
function sameVnode (a, b) {
  return a.key === b.key && a.tag === b.tag
}
````

其实主要就是判断**标签名**和**key**（当然还有isComment和data...的一些判断，此处为了方便理解就忽略了

着重注意一下这个**key**，当我们使用`v-for`的时候总是会带上的`key`就是它，它参与了我们sameVNode的判断，直接影响了组件更新的更新机制（之后还会出现再次介绍它的作用，此处先简单的介绍一下概念）

### updateVNode

当确认老Vnode和新VNode是sameVnode时，我们就开始正式的更新Vnode了也就是我们的diff算法，我们再来回顾一下之前所说的简单Vnode

````js
/** 这是一个极简的虚拟DOM */
const vnode = {
  tag: 'div',
  attr: {class: 'box'},
  children: [{tag: 'span', attr: {class: 'content'}, children: [1]}]
}
````

可以看到Vnode主要包含三部分内容`tag`、`attr`和`children`，我们更新时由于在`sameVNode`判断时就已经判断的`tag`，所以之后就只需要判断`attr`和`children`，其中`attr`我们更新方式无非就是增、删、改，接下来主要介绍我们是如何更新`children`的。这里也是diff算法的核心所在

### updateChildren

我们可以看到children是一个数组，vue中使用`updateChildren`来对比新children的数组和老children的数组的差别进行更新。对比更新的主要思想就是：**尽量复用可以复用的VNode节点**

为了方便我们把老children数组叫做`oldCh`，新children数组叫做`newCh`，整个对比过程如下：

首先将`oldCh`设置两个索引

1. `oldStartIndex`标识第一个oldCh，也就是`oldCh[0]`
2. `oldEndIndex`标识最后一个oldCh，也就是`oldCh[oldCh.length - 1]`

然后同样的为`newCh`添加`newStartIndex`和`newEndIndex`两个索引



举个简单的例子：

当我们把children从 [A, B, C, D]变成[D, C, B, A, E]时，开始标记会是这样的，我这里直接使用[《VueJs技术揭秘中组件更新》](https://ustbhuangyi.github.io/vue-analysis/v2/reactive/component-update.html#updatechildren)的例子

<img src="https://tva1.sinaimg.cn/large/0081Kckwgy1gl9ytq0asbj311i0jydp5.jpg" alt="image-20201203001434448" style="zoom:50%;" />

了解了这个结构我们接下来介绍一下diff算法是如何一步步进行更新的

整个diff逻辑说简单点就是：**对比`oldStartIndex`、`oldEndIndex`与`newStartIndex`、`newEndIndex`是否为sameVNode，如果为sameVNode说明可以复用**（记得sameVNode的条件是tag与key）

所以可以看出有两种分支：

1. **`oldStartIndex`、`oldEndIndex`与`newStartIndex`、`newEndIndex`**其中有sameVNode
2. 没有sameVNode



我们先说有sameVnode的情况：

1. oldStartIndex与newStartIndex可复用

````js
/** 由于位置一致直接patch，变动的节点向中间移动 */
if (sameVnode(oldStartVnode, newStartVnode)) {
	patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
	oldStartVnode = oldCh[++oldStartIdx]
	newStartVnode = newCh[++newStartIdx]
}
````



2. oldStartIndex与newEndIndex可复用

````js
/** 由于位置不一致，旧的children首部变成新的children尾部了，所以把VNode向右➡️移动到尾部，变动的节点向中间移动 */
if (sameVnode(oldStartVnode, newEndVnode)) {
  patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
  canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
  oldStartVnode = oldCh[++oldStartIdx]
  newEndVnode = newCh[--newEndIdx]
}
````



3. oldEndIndex与newStartIndex可复用

````js
/** 由于位置不一致，旧的children尾部变成新的children首部了，所以把VNode向左⬅️移动到首部，变动的节点向中间移动 */
if (sameVnode(oldEndVnode, newStartVnode)) {
  patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
  canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
  oldEndVnode = oldCh[--oldEndIdx]
  newStartVnode = newCh[++newStartIdx]
}
````



4. oldEndIndex与newEndIndex可复用

````js
/** 由于位置一致直接patch，变动的节点向中间移动 */
if (sameVnode(oldEndVnode, newEndVnode)) {
  patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
  oldEndVnode = oldCh[--oldEndIdx]
  newEndVnode = newCh[--newEndIdx]
}
````

接下来再说没有sameVNode的情况

**当此时的几个坐标都没有sameVNode时，我们会将`newStartVNode`遍历查询所有的`oldCh`看看有没有能匹配得上的节点**

- 如果有，则移动对应的节点

- 如果没有，那么就创建新节点



**由于`oldCh`与`newCh`的长度不一定一致，所以当我们遍历到一定阶段时，可能会出现`oldCh`或者`newCh`先遍历结束的情况。此时我们会对比是哪个先结束**

- `oldCh`先结束，说明`newCh`还有未插入的节点，于是新增这些未插入节点
- `newCh`先结束，说明`oldCh`还有多余节点，于是删除这些多余节点

整理成一张思维导图diff算法如下：![diff](https://tva1.sinaimg.cn/large/0081Kckwgy1gl9zzcdblvj31km0sktf4.jpg)



其中有一个优化点就是：**当我们不存在sameVNode进行遍历时，如果组件存在key，那么Vue会进行一个key与index的映射，这样我们就不用再进行遍历一个个比对查询sameVNode了，这里也是key优化组件更新的一个技巧**

## 总结

我们回顾一下Vue组件更新的一些原理：

1. 虚拟DOM是什么？为什么使用虚拟DOM
   1. 减少操作真实DOM的开销
   2. 多平台的可能性

2. 组件更新的过程
   1. 判断sameVNode
   2. updateChildren
3. diff算法
   1. 见思维导图
4. key的作用
   1. 区分sameVNode
   2. 通过keyToIndex优化diff的对比逻辑

