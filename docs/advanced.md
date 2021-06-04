
# 高级配置

这篇文章介绍一些高级配置的配置项，这些配置项虽然在日常项目中配置的较少，但是对于项目来说这些配置项往往是可以解决日常常见的问题。

## 使用拆包

在项目中，不合理的 Bundle 是致命的。在 Webpack 中，总共提供了三种方式来实现代码拆分（Code Splitting）：

-   entry 配置：通过多个 entry 文件来实现；
-   动态加载（按需加载）：通过写代码时主动使用`import()`或者`require.ensure`来动态加载；
-   抽取公共代码：使用`splitChunks`配置来抽取公共代码。

在 San CLI 中可以通过`splitChunks`抽取公共代码。`splitChunks`的配置项跟 Webpack 中 `optimization`的`splitChunks`是完全相同的。例如下面的配置：

```js
module.exports = {
    // ...
    splitChunks: {
        cacheGroups: {
            vendors: {
                name: 'vendors',
                test: /[\\/]node_modules(?!\/@baidu)[\\/]/,
                // minChunks: 1,
                priority: -10
            },
            common: {
                name: 'common',
                test: /([\/]src\/components(-open)?|[\\/]node_modules\/@baidu\/nano)/,
                priority: -20,
                minChunks: 1,
                chunks: 'initial'
            }
        }
    }
};
```

> 同时 San CLI 内置了 [optimize-css-assets-webpack-plugin](https://github.com/NMFR/optimize-css-assets-webpack-plugin)，也就是说支持使用 splitChunks 来拆分 CSS 文件。

## 代码压缩和优化

在项目中可以对产出的代码中压缩和优化，在 San CLI 的 JS 使用了 terserjs 和 CSS 使用 cssnano。支持默认 San CLI 的配置是：

默认 cssnano 配置：

```js
{
    mergeLonghand: false,
    cssDeclarationSorter: false,
    normalizeUrl: false,
    discardUnused: false,
    // 避免 cssnano 重新计算 z-index
    zindex: false,
    reduceIdents: false,
    safe: true,
    // cssnano 集成了autoprefixer的功能
    // 会使用到autoprefixer进行无关前缀的清理
    // 关闭autoprefixer功能
    // 使用postcss的autoprefixer功能
    autoprefixer: false,
    discardComments: {
        removeAll: true
    }
}
```

在 San CLI 的配置文件中，所有跟 CSS 的相关的配置是放在了`css`配置项中，所以对 cssnano 的修改也是在`css.cssnanoOptions`中进行修改：

```js
module.exports = {
    // ...
    css: {
        cssnanoOptions: {
            // 自定义的配置
        }
    }
};
```

默认 terserjs 配置：

```js
{
    comments: false,
    compress: {
        unused: true,
        // 删掉 debugger
        drop_debugger: true, // eslint-disable-line
        // 移除 console
        drop_console: true, // eslint-disable-line
        // 移除无用的代码
        dead_code: true // eslint-disable-line
    },
    ie8: false,
    safari10: true,
    warnings: false,
    toplevel: true
}
```

San CLI 的配置文件中使用`terserOptions`可以对默认的配置进行修改：

```js
module.exports = {
    // ...
    terserOptions: {
        // 自定义的配置
    }
};
```

### esbuild

> 实验性功能，可能会有坑，但可以有效提升速度体验

压缩js除使用默认 terserjs外，还可以使用esbuild压缩，开启方式

```js
module.exports = {
    // ...
    esbuild: true // 或填入{}也可
};
```

将使用以下默认配置进行压缩

```js
{
    // ...
    minify: true,        
    target: 'es2015',
};
```

也可通过esbuild项直接传入配置，具体配置见（https://github.com/privatenumber/esbuild-loader）

esbuild开启后，默认也会在开发环境下使用esbuild-loader替换babel-loader，速度大幅提升

esbuild也可以开启css压缩（默认不开启），按照如下方式传入即可

```js
module.exports = {
    // ...
    esbuild: {css: true}
};
```

### unsafeCache
webpack5新增的安全策略，对应config.module.unsafeCache, 开启后（true）可加快构建速度，默认不开启（false）

### thread
生产环境下开启多进程打包，开启方式

```js
module.exports = {
    // ...
    thread: true // 或填入{}也可
};
```

thread传入true可开启，还可传入[thread-loader](https://webpack.js.org/loaders/thread-loader/)的配置对象，替换默认配置

### html-minifier 配置

除此之外，San CLI 中使用的 html-webpack-plugin 的配置项中可以使用 html-minifier，在 San CLi 中默认的配置如下：

```js
{
    removeComments: true,
    collapseWhitespace: false,
    removeAttributeQuotes: true,
    collapseBooleanAttributes: true,
    removeScriptTypeAttributes: false,
    minifyCSS: true,
    // more options:
    // https://github.com/kangax/html-minifier#options-quick-reference
}
```

使用者可以在`pages`中的`html-minifier`进行配置，具体配置可以[参考这里](https://github.com/DanielRuf/html-minifier-terser#options-quick-reference)。

## 编译 NPM 包中的 ES6 语法

在项目中，我们推荐使用 ESM 语法的模块，ESM 语法的模块在使用的同时，可以使用统一 的 Webpack 配置，并且基于 Tree-shaking，打出的包体积更加合理。但是在 San CLI 中，默认是不会编译 NPM 包中的 ES6 语法的代码，这时候依赖的 NPM 包中使用 ES6 语法，需要使用`transpileDependencies`。

`transpileDependencies`可接受的类型为`Array`、`String`或者`RegExp`。例如我们项目依赖`@baidu/nano`这个 UI 基础库，则可以设置配置如下：

```js
module.exports = {
    // ...
    transpileDependencies: ['@baidu/nano']
};
```

这样`nano`这个模块就会被 Webpack 编译了。

## 使用 chainWebpack 和 configWebpack 进行个性化配置

如果要更加自主的进行个性化的配置，那么可以在 San CLI 配置文件中的 chainWebpack 和 configWebpack 进行修改，`chainWebpack` 接受的参数是 [webpack-chain](https://github.com/neutrinojs/webpack-chain) 语法的配置，`configWebpack`接受的参数是 Webpack 的配置对象。

例如：

```js
// 静态文件域名
const CDN = 'https://s.bdstatic.com/';
// 生产环境下的静态目录
const STATIC_PRO = 'static/pro';

module.exports = {
    chainWebpack: config => {
        // 这里可以用来扩展 webpack 的配置，使用的是 webpack-chain 语法
        config.module
            .rule('img')
            .test(/\.(png|jpe?g|gif)(\?.*)?$/)
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options({
                limit: 1000,
                name: STATIC_PRO + '/img/[name].[hash:7].[ext]',
                publicPath: __isProduction ? CDN : ''
            });

        config.module
            .rule('svg')
            .use('svg-url-loader')
            .loader(require.resolve('svg-url-loader'))
            .options({
                limit: 2500,
                name: STATIC_PRO + '/svg/[name].[hash:7].[ext]',
                publicPath: __isProduction ? CDN : ''
            });
    }
};
```

## 在配置文件中添加 Service 插件

`plugins` 增加自定义插件，例如：

```js
module.exports = {
    plugins: [
        {
            id: 'built-in:plugin-progress',
            apply(api, projectOptions, options = {}) {
                api.chainWebpack(webpackConfig => {
                    options.color = require('san-cli-utils/randomColor').color;
                    webpackConfig.plugin('progress').use(require('webpackbar'), [options]);
                });
            }
        },
        'san-plugin.js'
    ]
};
```

## 添加 dev server 中间件

添加 dev server 中间件，需要使用 Service 的插件的`addDevServerMiddleware`方法，例如：

```js
const plugins = [
    {
        id: 'middleware1',
        apply(api) {
            // 使用 api 配置dev server 中间件
            api.middleware(() =>
                require('hulk-mock-server')({
                    // 配置contentBase
                    contentBase: path.join(__dirname, './' + outputDir + '/'),
                    // 配置 mock 路径
                    rootDir: path.join(__dirname, './mock'),
                    // 配置解析器相关内容
                    processors: [
                        `smarty?router=/template/*&baseDir=${path.join(
                            __dirname,
                            `./${outputDir}/template`
                        )}&dataDir=${path.join(__dirname, './mock/_data_')}`
                    ] // eslint-disable-line
                })
            );
        }
    }
];
module.exports = {
    plugins
};
```

::: warning
这里特殊说明下，`middleware`传入的是一个 function，并且**返回**一个中间件。
:::

## 更多

如果想了解更多 Service 插件相关内容，那么请浏览[这个文档](./srv-plugin.md)
