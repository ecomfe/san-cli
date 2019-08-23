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

## 修改设计稿宽度比例
即修改`pr2rem`插件的配置，hulk 内置的插件配置为：

```js
{
    // 设计图为1242px
    rootValue: 124.2,
    unitPrecision: 5,
    propWhiteList: [],
    propBlackList: [],
    selectorBlackList: [],
    ignoreIdentifier: '00',
    replace: true,
    mediaQuery: false,
    minPixelValue: 0
}
```

如果要修改配置，可以通过`hulk.config.js`的`loaderOptions`对 postcss 的内置插件配置进行修改，具体代码示例如下：

```js
loaderOptions: {
    // babel plugins
    // babel: {
    //     plugins: [require(xxx)]
    // }
    // postcss plugins
    postcss:{
    //     plugins: [rquire(xxx), options],
        builtInPluginConfig: {pr2rem: {
            rootValue: 124.2,
            unitPrecision: 5,
        }}
    }
}
```

如果项目有自己的 postcss 配置，那么可以直接修改自己的 postcss 配置，hulk 会优先使用项目根目录的 postcss 配置文件。
