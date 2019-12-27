---
title: 现在的浏览器打包模式
---

# Modern Mode

现在相信很多团队的代码都是直接用 ES2015+ 语法来编写和维护，然后通过 Babel 将 ES2015+ 语法转成支持老浏览器的 js 代码，经过转换后的 js 代码从体积和解析执行效率上都比转换前有损耗。

## 兼容性

从 Caniuse 网站的数据来看，现在绝大多数的浏览器已经对 ES2015+有了很好的支持，而经过我们统计百度 APP 的 Webview 浏览器数据来看，国内大概有**74.71%**的浏览器支持 ES2015+代码，这说明有 70%的浏览器是不再是老版本的浏览器，而我们却因为 30% 不到的浏览器影响了 70% 的本来应该更快更好的现在浏览器。

如果能够在一个网站上自动识别不支持 ES2015 语法的浏览器，执行 Babel 转换后 ES2015-的代码，而支持 ES2015+的浏览器直接使用 ES2015+代码就好了！好消息是目前有方法这样做了，[这篇文章](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)已经有详细的介绍了。

在 San CLI 中也吸收了这个方案！只需要使用`san build --modern`既可以打出对应的代码。

## 简单说实现


在 Modern Mode 打包的时候，会打包两次，第一次正常打包生成老浏览器代码，第二次修改 Babel 的 `target='module'`，打包出来的 js 代码是 ES2015+，然后通过 html-webpack-plugin 的插件，将两次打包的 js 文件进行整合，生成下面的 HTML 片段：

```html
<script type=module src=/js/modern.js></script>

<script>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script>

<script type=text/javascript src=/js/legacy.js nomodule></script>
```

实现：

-   Modern 浏览器通过 `<script type="module">` 在被支持的浏览器中加载，同时忽略`nomodule`的 script 代码；
-   老版本浏览器不支持`type=module`的`script`，则会加载`nomodule`的 script；
-   另外针对 Safari 10 中 bug 还使用一段代码进行修复。

## 收益

在我们项目的实际应用中，Modern Mode 能有效缩减代码 bundle 总体积，提升代码载入执行速度，实际项目数据如下：

1. 体积减少 10K；
2. 安卓首屏减少 100ms 左右，iOS 首屏减少 60ms 左右；

::: warn 特殊说明
Modern Mode 的具体收益受具体项目而影响，上面的数据仅供参考，不过 Modern Mode 肯定是正向的！
:::
