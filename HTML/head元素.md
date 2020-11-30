# head元素

## 大纲
1. 描述页面基础信息
2. 指向渲染页面所需要的其他链接
3. 各厂商定制信息

## head元素的两个属性
1. name
2. http-equiv
3. charset(原为http-equiv, 现改为charset)

## 描述页面基础信息
````html
<!-- 页面编码格式 -->
<meta charset="utf-8">
<!-- IE版本渲染设置 -->
<meta http-equiv="X-UA-Comptible", content="ie-edge">
<!-- 移动端所需要的视窗配置 -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- SEO: 关键字 -->
<meta name="keywords" content="关键字1, 关键字2">
<!-- SEO: 详细描述 -->
<meta name="description" content="详细描述">
<!-- 网页浏览器缓存设置 -->
<meta name="cache-control" content="no-store">
<!-- 禁止网页中☎️号码/email自动转为超链接 -->
<meta name="format-detection" content="telephone=no, email=no">
````

## 指向渲染页面所需要的其他链接
````html
<!-- 页面标题小图标 -->
<link rel="shortcut icon" href="favicon.png">
<!-- 添加到主屏幕图片(高光版图标) -->
<link rel="apple-touch-icon", href="//www.bilibili.com/favicon.ico">
<!-- 添加到主屏幕图片(原图图标) -->
<link rel="apple-touch-icon-precomposed", href="//www.bilibili.com/favicon.ico">
<!-- css样式资源链接 -->
<link rel="stylesheet" type="text/css" href="xx.css">
<!-- js资源链接 -->
<script src="xx.js"></script>
````

## 各厂商定制信息
````html
<!-- 360渲染 -->
<meta name="render" content="webkit">
<!-- QQ分享 -->
<meta itemprop="name" content="分享标题">
<meta itemprop="image" content="logo.png">
<meta name="description" itemprop="description" content="分享内容">
<!-- IOS -->
<!-- 隐藏🍎状态/工具栏 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<link rel="apple-touch-icon" href="touch-icon-iphone.png">
<link rel="apple-touch-startup-image" href="/startup.png"> 
````

## 参考链接
<a href="https://segmentfault.com/a/1190000004279791">HTML meta标签总结与属性使用介绍</a>
