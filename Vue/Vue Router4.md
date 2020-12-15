# Vue3.0迁移（Vue Router篇）

Vue3.0推出已经有一段时间了，很多项目都有想向Vue3.0迁移的想法。但是升级Vue3.0的同时，我们也要兼顾Vue生态的其他插件（如果你有使用的话），比如Vue Router。

幸运的是我们团队最近的新项目打算使用Vue3.0试试水，在使用过程中我发现目前的Vue Router3.x版本并不能与Vue3.0很好的兼容。于是试用了一下Vue Router4版本，和大家分享一下Vue Router4的使用方法

## 安装

安装Vue Router4.x版本目前可以通过

````js
npm install vue-router@4
````

进行安装

## 使用

在使用上，由于Vue3.0之后不再暴露Vue原型，所以我们使用插件的方式也不一样。所以我们需要进行两部分改动

- **Vue3.0使用插件的变更**
- **Vue Router使用方法的变更**

### Vue3.0使用插件的变更

以往我们Vue2.0的项目中使用插件的方式是这样的（此处以Vue Router为例）

````js
/** Vue2.0版本 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter) // 这里直接通过Vue.use方式注册插件

const app = new Vue({})
app.$mount('#app')
````

但是Vue3.0之后不再通过`new Vue`这种方式创建实例，转而暴露出`createApp`方法创建。所以**我们使用插件的方式也不再是通过`Vue.use`进行注册，而是转化为直接通过创建的实例注册**，就像下面这样

````js
/** Vue3.0版本 */
import { createApp } from 'vue'
import { router } from './router/index'

const app = new createApp({})
app.use(router) // 这里通过app.use方式注册插件
app.mount('#app')
````

这里我们暂时使用router的变更封装在`./router/index`里面，下面我们来看看Vue Router使用方法的变更

### Vue Router使用方法的变更

原来我们使用Vue Router的方法是这样的

````js
/** Vue Router3.x版本 */
import VueRouter from 'vue-router'
import AComponent from './a.vue'
import BComponent from './b.vue'

const routes = [
  {
    path: '/a',
    component: AComponent,
  },
  {
    path: '/b',
    component: BComponent,
  }
]

const router = new VueRouter({
  routes,
})

export {
	router
}
````

在Vue Router4升级后，**我们的`VueRouter`原型也不再直接暴露出来，转而使用`createRouter`的方法来创建router。除此之外，我们也将不再通过指定`mode`的值来指定路由模式，而是转而使用`history`字段的函数赋值方式**。

将上面例子通过Vue Router4的方式改造一下是这样的

````js
/** Vue Router4.x版本 */
import { createRouter, createWebHistory } from 'vue-router'
import AComponent from './a.vue'
import BComponent from './b.vue'

const routes = [
  {
    path: '/a',
    component: AComponent,
  },
  {
    path: '/b',
    component: BComponent,
  }
]

const router = new createRouter({
  history: createWebHistory(), // history为必填项
  routes,
})

export {
	router
}
````

可以看到我们路由方式目前已经通过`history`来进行指定了，而不是通过原来我们的`mode`值来定。不同路由的创建方式如下：

- **history**: createWebHistory()
- **hash**: createWebHashHistory()
- **abstract**: createMemoryHistory()

完成这两步，你就已经可以上手使用Vue Router4.x版本了

## 文档

我们这里讲的只是Vue Router4.x版本最基础的使用。如果你还用到了很多其他特性，或者想要查看Vue Router4.x版本完整文档，可以访问下面链接（目前文档还是全英版本）：

[Vue Router4.x官方文档](https://next.router.vuejs.org/)

[Vue Router迁移指南](https://next.router.vuejs.org/guide/migration/index.html#breaking-changes)

