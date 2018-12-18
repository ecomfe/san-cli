
# 特性
## 组件级别热重载

![san-webpack-loade](http://ov35lvdq9.bkt.clouddn.com/san-webpack-hot.gif)

`san-webpack-loader` 引入了`san-hot-reload-api`这个库作为hot-reload的控制器，分别会在组件生命周期的`attached`和`detached`钩子中注入相应的代码以便在每一次组件更新时完成相应的更新和销毁逻辑。

而当样式发生改变时，目前使用了`style-loader`的热更新机制向上冒泡，由于`san-webpack-loader`在构建时处理了模块的依赖引用，所以样式的更新会被直接注入到`<head>`中而不会引起组件的变化。

遗憾的是，san.js的模板并非一个无副作用的渲染函数，所以无法完成vue.js中的`template`发生修改，本组件就地重新渲染的效果。

## 零配置
零配置这个词真正火起来，要归功于webpack的竞争对手：parcel。

parcel按照约定大于配置的思想，固定了大部分的配置项，以达到开箱即用的效果。
随后webpack4也吸收了这样的思想，大幅精简了令人头疼的配置问题。

```js
@file loader.js
const isProduction = process.env.NODE_ENV === 'production';
```

由于webpack4内置的`mode`模式，`san-webpack-loader`内部只会通过判断`process.env.NODE_ENV`是否等于`production`来进行开发环境和生产环境的区分。

### 开发环境
- 热重载
- 使用`style-loader`

### 生产环境
- 模板压缩
- 使用 `MiniCssExtractPlugin`
- 使用 `cache-loader` 做文件缓存


## 组件的标签限制

每一个组件只可以分别拥有一个`style / template / script`标签。

style标签仅支持`lang = css / stylus / postcss`三种语言。

这样的限制主要是为了精简配置项，更专注于业务。

而在日常的业务开发中，以上的配置已经完全满足我们的需求了。

```js
@file webapck.config.js
    {
        test: /\.css$/,
        include: resolve('src'),
        use: [
            {loader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader'},
            {loader: 'css-loader'},
            {loader: 'postcss-loader'}
        ]
    },
    {
        test: /\.styl$/,
        include: resolve('src'),
        use: [
            {loader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader'},
            {loader: 'css-loader'},
            {loader: 'postcss-loader', options: {sourceMap: true}},
            {loader: 'stylus-loader'}
        ]
    },
                ...
```

在开发环境中，不管是直接在组件中写入的style标签，还是在模块中import进来的`css / styl`文件，
最终都会经过`stylus-loader？ => postcss-loader => css-loader => style-loader `的转换，由`style-loader`提供样式的hot-reload功能。

而在生产环境下，唯一的不同就是最后的`style-loader`换成了`MiniCssExtractPlugin.loader`，通过这个插件提供的loader来做最终编译的样式提取及优化。

需要注意的是，`MiniCssExtractPlugin`这个插件在`san-webpack-loader`中是默认必须安装的，未来，这个插件也会提供样式的热重载功能，这样我们就可以完全替换掉style-loader来保证更加一致的开发和编译结果。

## Template Literal

![](http://ov35lvdq9.bkt.clouddn.com/15233423130901.jpg)

你可以像上图这样，将其他模块引入的字符串或变量，通过es6的模板字符串语法直接写在`template`中。

![](http://ov35lvdq9.bkt.clouddn.com/15233424662700.jpg)

最终，`san-webpack-loader`会帮你在构建时静态编译成字符串。


## Babel / Postcss 配置
![](http://ov35lvdq9.bkt.clouddn.com/15233427525860.jpg)

`san-webpack-loader`尊重社区的主流做法，只需在项目根目录创建相应的`.babelrc`和`postcss.config.js`文件对`Babel / Postcss`进行相应的插件和配置处理，loader会自动读取相应的配置文件并进行构建。


## CSS IN JS
敬请期待。
