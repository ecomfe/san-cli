# 移动多屏适配方案
原理详见：https://aotu.io/notes/2017/04/28/2017-4-28-CSS-viewport-units/index.html

项目实现通过 postcss+pr2rem 插件，默认使用的是宽度为`1242px`的设计稿为基准（在`postcss.config.js`中修改，统一使用html font-size=`10vw`）。

css 书写不再使用`bsass`的`rem(*)`的方式，而是使用`pr`：

```css
// input
// pr 是真实设计稿测量出来的宽度
h2 {
    margin: 1242pr 1242pr 40px 50px;
    font-size: 32px;
}

// output
h2 {
    margin: 20rem 20rem 40px 50px;
    font-size: 32px;
}
```

