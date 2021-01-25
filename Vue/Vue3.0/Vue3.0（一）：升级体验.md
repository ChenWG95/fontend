# Vue3.0（一）：升级体验

Vue3.0已经推出了一段时间了，在使用过程中我确实可以感觉到一些便利和进步。在前段时间里，团队刚刚通过Vue3.0落地实践了一个项目，我作为核心研发参与了不少内容开发，在这里总结一下使用Vue3.0不同之处。

## 与Vue2.0的不同之处

关于Vue3.0的升级相关已经在[One Piece发布声明](https://github.com/vuejs/vue-next/releases/tag/v3.0.0)中说的很清楚了，有兴趣的小伙伴可以看一下。升级Vue3.0之后大部分Vue2.0的使用方法并没有进行变动，这里我详细说一下使用方面相较于Vue2.0的改进之处，总结下来主要有三部分：

- Object.definedProperty 升级为 Proxy
- CompositionAPI
- Tree Shrinking

### Object.definedProperty vs Proxy

我们知道Vue2.0的响应式由Object.definedProperty实现，而Vue3.0升级为Proxy实现。且不谈实现上有什么异同，我们来看看对于具体的用法方面会带来什么不同。



在Vue2.0中我们通过Object.definedProperty实现属性的依赖收集和响应派发，以Vue2.0的实现，这样做会存在两个问题：

1. **无法监听对象的新增属性和属性删除**
2. **对于复杂对象的遍历十分消耗性能**

关于第一点，Vue2.0提供了`Vue.$set`和`Vue.$delete`方法进行补充以确保可以监听到相关变动并进行视图更新，而关于第二点除了修改Vue2.0源码并没有什么很好的解决方案（比如当遇到属性为复杂对象时，get时再进行遍历操作）。



而Vue3.0采用的Proxy方法就可以比较好的规避Vue2.0的两点不足

1. 无法监听对象的新增属性和属性删除：**Proxy代理的是整个对象，所以对象的属性新增和删除均可以监听**
2. 对于复杂对象的遍历十分消耗性能：**由于Proxy代理的是对象的第一层属性，并不会向下遍历，所以我们的代理触发get时再进行遍历收集依赖即可。**

Tips：对Proxy还不熟悉的小伙伴可以查看[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy)进行了解



在使用上，以代码的方式直观的进行展示

````js
// Vue2.0
import Vue from 'vue'

new Vue({
  data () {
    return {
      person: { name: 'Mike' }
    }
  },
  method () {
    addPropery(key, value) {
      Vue.set(this.person, key, value)
    },
    deleteProperty(key) {
      Vue.delete(this.person, key)
    }
  }
})

// Vue3.0
Vue.createApp({
  data() {
    return {
      person: { name: 'Mike' }
    }
  },
  method() {
    addPropery(key, value) {
      this.person.key = value
    },
    deleteProperty(key) {
      delete this.person.key
    }
  }
})
````



### Composition API vs mixin

除了Proxy的升级外，还有一个激动人心的改动：**Composition API**。在Vue3.0以前，我们编写组件的方式是通过Options API进行编写，也就是我们在data里面定义属性，method里面编写方法，按照Vue提供的Option来编写组件，这样的好处是：简单，直观。但是随之而来存在一个问题：**复杂场景下我们的组件体积会极大且难以解耦，我们可以通过封装通用或工具函数的方式进行代码拆分，但是这种方式很难拆分组件本身的逻辑且无法很好的解耦组件生命周期相关逻辑**。

对此Vue2.0提供了mixin方法解决这个问题，通过mixin，我们可以编写提供和Vue实例一样的option对象进行合并。但是后来我们在实践中发现mixin也会随之而来带来一些问题：

1. **各option中的属性可能存在冲突**（除了生命周期，因为生命周期采用合并策略）
2. **对于使用mixin中的属性和方法不清楚来源和影响**
3. **重用性受限制，因为mixin并不能传递参数进行定制逻辑**



为了解决mixin存在的这些问题，Vue3.0添加了一种通过逻辑关注点拆分代码的方式，这就是：Composition API

````js
// mixin
const myMixin = {
  data() {
    return {
      message: 'hello',
      foo: 'abc'
    }
  }
}

const app = Vue.createApp({
  mixins: [myMixin]
})

// Composition API
function myCompositionAPI (msg) {
  const message = ref(msg)
  const foo = ref('abc')
  
  return {
    message,
    foo
  }
}

const app = Vue.createApp({
  setup() {
    const { message, foo } = myCompositionAPI('hi')
    
    return {
      message,
      foo
    }
  }
})
````

可以看到，通过CompositionAPI的方式，我们对于以上几个问题的解决：

1. 各option中的属性可能存在冲突：**myCompositionAPI可以存在局部变量，暴露出去的状态和方法也可以直观的看到**
2. 对于使用mixin中的属性和方法不清楚来源和影响：**通过myCompositionAPI的方式组织聚合，清楚来源，影响也被隔离**
3. 重用性受限制：**由于myCompositionAPI是函数，所以可以进行传参自定义逻辑**



### Tree Shrinking

Vue3.0引入了Tree Shrinking去除没有用到的功能代码来优化包体积，这也意味着我们相关的使用方法也会有些变化。我们不能再直接使用一个导出的Vue来进行处理了，相应的我们需要更加细粒度的进行声明和引用，在使用方面主要由如下几个方面变化：

Vue实例的创建

````js
// Vue2.0
import Vue from 'vue'

const app = new Vue({})

// Vue3.0
import { createApp } from 'vue'

const app = createApp({})
````



插件的使用

````js
// Vue2.0
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const app = new Vue({})

// Vue3.0
import { createApp } from 'vue'
import { router } from '@/router'

const app = createApp({})
app.use(router)
````



Composition API相关

````js
// Composition API
import { reactive, ref, watch, computed, onMounted } from 'vue'

function myCompositionAPI() {
	// 各种API使用
}
````

可以看到，Tree Shrinking主要还是对于包体积优化，对我们的使用上并没有太大的变化，只需要稍微注意一下即可



可以看到，Vue3.0对我们影响最大的改动可以说是CompositionAPI了，接下来我们将主要介绍一下CompositionAPI的使用以及其原理分析。

