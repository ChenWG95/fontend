# Vue Plugin

## Plugin是用来做什么的
插件一般没有严格定义，你可以想怎么样就怎样，不过我们一般会封装一些全局的方法/属性的放进去，任何你觉得可以结偶出来作为独立模块的封装都可以写成插件哈哈哈

## 什么是Plugin
### 使用Plugin
当你写下类似下面这种代码的时候，你用的就是插件
````javascript
import somePlugin from 'somePlugin'

Vue.use(somePlugin)
````

那这个plugin如何开发呢？其实很简单，一个插件就是一个js对象，不过这个对象有一点差别，他需要有一个install方法。举个最简单的例子：
````javascript
const myPlugin = {
  install () {
    // some code
  }
}
````
或者更简单一点，插件也可以是一个纯函数，他会被自动转化成install方法，像是这样
````javascript
function myPlugin () { 
  // some code 
}
````

然后还有一点，对于install方法，我们有一些规定：这个install方法需要传两个参数，第一个是Vue，第二个是你所需要的参数选项，所以完整的插件大概是这样的
````javascript
const myPlugin = {
  install (Vue, options) {
    // some code
  }
}
````

````javascript
function myPlugin (Vue, options) {
  // some code
}
````

## 如何实现一个Plugin
````javascript
const myPlugin = function (Vue, options) {
  // vue mixin
  Vue.mixin({
    created: function () {
      // something
    }
  })

  // vue 自定义指令
  Vue.directive('my-directive', function () {
    // 这里将会被 `bind` 和 `update` 调用
  })

  // vue 全局方法
  Vue.myGlobalMethod = function () {
    // something
  }

  // vue 添加实例
  Vue.prototype.$myMthod = function () {
    // something
  }
}
````

或者是这样：
````javascript
const myPlugin = function (Vue, options) {
  // vue mixin
  Vue.mixin({
    created: function () {
      // something
    }
  })

  // vue 自定义指令
  Vue.directive('my-directive', function () {
    // 这里将会被 `bind` 和 `update` 调用
  })

  // vue 全局方法
  Vue.myGlobalMethod = function () {
    // something
  }

  // vue 添加实例
  Vue.prototype.$myMthod = function () {
    // something
  }
}
````

## 穿插知识点：Vue.$options实现获取自定义属性
比如你需要进行一些自定义选项的时候，你除了Vue设置的属性，还可以获取一些其他的属性比如这样
````javascript
new Vue({
  data () {},
  myOption: () {}, // vue原生是没有myOption这种选项的
  mounted () {
    this.$options.myOption  // 这样就可以获取你自定义的myOption选项了
  }
})
````
这样有什么用呢？我们可以在我们的插件里面这样写，比如：
````javascript
const myPlugin = function (Vue, options) {
  Vue.$options.myOption
}
````

## 总结
今天就大概介绍一下插件是什么样的，其实大家可以看到很简单，其实我们只需要按照规定的格式，就可以完成插件的开发了