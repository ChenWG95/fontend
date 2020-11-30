# CSS语法：除了属性和选择器，你还需要知道这些带@的规则
---
## CSS规则分类
- @规则
- 普通规则

## CSS@规则
- @charset：字符编码格式
- @import：引入css文件
- @media：媒体查询
- @page：？分页媒体访问网页时的表现设置
- @counter-style：？产生一组数据，定义列表项的表现
- @keyframes：动画关键帧
- @fontface：定义字体
- @supports：检查环境的特性与media类似
- @namespace：css命名空间

## CSS普通规则
- css选择器
- css伪类
````css
/* 自定义css变量--开头 */
:root {
  --main-color: #ccc;
  --accent-color: #ffffff;
}
/* 通过var使用css变量 */
.test {
  color: var(--main-color)
}
/* calc混合计算 */
/* max，min，clamp超出范围使用 */
/* toggle多元素值切换 */
ul {
  list-style-type: toggle(circle, square)
}
````
