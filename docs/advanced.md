
# 高级配置

这篇文章介绍一些高级配置的配置项，这些配置项虽然在日常项目中配置得较少，但是对于项目来说这些配置项往往是可以解决日常常见的问题。

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
            defaultVendors: {
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

## 代码压缩和优化

在项目中可以对产出的代码进行压缩和优化，San CLI 会对 JS 使用 terserjs 和对 CSS 使用 cssnano。

默认的 terserjs 配置：

```js
{
    format: {
        comments: false
    },
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

默认的 cssnano 配置：

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
    // cssnano 集成了 autoprefixer 的功能
    // 会使用到 autoprefixer 进行无关前缀的清理
    // 关闭 autoprefixer 功能
    // 使用 postcss 的 autoprefixer 功能
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

### loaderOptions.esbuild

> 实验性功能，可能会有坑，但可以有效提升速度体验。

压缩 js 除使用默认开启的 terserjs 外，还可以使用 esbuild 压缩，开启方式：

```js
module.exports = {
    // ...
    loaderOptions: {
        esbuild: true // 或填入 {}
    }
};
```

开启后将使用以下的默认配置进行压缩：

```js
{
    // ...
    minify: true,        
    target: 'es2015',
};
```

也可通过 esbuild 配置项直接传入配置，具体配置见[esbuild-loader](https://github.com/privatenumber/esbuild-loader)。

esbuild 开启后，默认也会在开发环境下使用 esbuild-loader 替换 babel-loader，速度会大幅提升。

esbuild 也可以开启 css 压缩（默认不开启），按照如下方式配置即可：

```js
module.exports = {
    // ...
    loaderOptions: {
        esbuild: {css: true}
    }
};
```

> 注意：若需要支持 ts 构建可按照 [esbuild-loader](https://github.com/privatenumber/esbuild-loader) 官方推荐方式传入配置，San CLI内默认的规则（`/\.(m?j|t)sx?$/`）已经支持对ts文件的检测。

```js
module.exports = {
    // ...
    loaderOptions: {
        esbuild: {
            loader: 'tsx',  // Or 'ts' if you don't need tsx
            target: 'es2015'
        }
    }
};

```

### unsafeCache

webpack5 新增了安全策略，对应 config.module.unsafeCache，开启后（true）表示忽略安全策略，可加快构建速度，默认不开启（false）。

### html-minifier 配置

San CLI 中使用的 html-webpack-plugin 的配置项中可以使用 html-minifier，在 San CLI 中默认的配置如下：

```js
{
    removeComments: true,
    collapseWhitespace: false,
    // 引号保留，不然 inline 的 base64 图片 compress 时报错
    removeAttributeQuotes: false,
    quoteCharacter: '"',
    collapseBooleanAttributes: true,
    removeScriptTypeAttributes: false,
    minifyCSS: true,
    // 处理 smarty 和 php 情况
    ignoreCustomFragments: [/{%[\s\S]*?%}/, /<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/],
    keepClosingSlash: true
    // more options:
    // https://github.com/kangax/html-minifier#options-quick-reference
}
```

使用者可以在`pages`中的`minify`项进行配置，例如：

```js
pages: {
    index: {
        entry: './src/pages/index/index.js',
        template: './template/index.tpl',
        filename: 'index.tpl',
        chunks: ['common', 'vendors'],
        minify: {
            collapseWhitespace: true,
            keepClosingSlash: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true
        }
    },
    ...
}
```

具体配置项可以[参考这里](https://github.com/DanielRuf/html-minifier-terser#options-quick-reference)。

## 编译 NPM 包中的 ES6 语法

在项目中，我们推荐使用 ESM 语法的模块，ESM 语法的模块在使用的同时，可以使用统一的 Webpack 配置，并且基于 Tree-shaking，打出的包体积更加合理。但是在 San CLI 中，默认不会编译 NPM 包中的 ES6 语法的代码，这时候如果需要编译依赖的 NPM 包中的 ES6 语法，需要使用`transpileDependencies`。

`transpileDependencies`可接受的类型为`Array`、`String`或者`RegExp`。例如我们项目依赖`@baidu/nano`这个 UI 基础库，则可以设置配置如下：

```js
module.exports = {
    // ...
    transpileDependencies: ['@baidu/nano']
};
```

这样`nano`这个模块就会被 Webpack 编译了。

## 使用 chainWebpack 和 configWebpack 进行个性化配置

如果要更加自主地进行个性化的配置，那么可以用 San CLI 配置文件中的 chainWebpack 和 configWebpack 来修改配置，`chainWebpack` 接受的参数是 [webpack-chain](https://github.com/neutrinojs/webpack-chain) 语法的配置，`configWebpack`接受的参数是 Webpack 的配置对象。

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
            apply(api, options = {}) {
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

## 在配置文件中添加配置包

`extends` 增加自定义配置包，以 `san-cli-config-demo` 包为例：

```js
// san.config.js
module.exports = {
    extends: [
        ['san-cli-config-demo']
    ]
};

```
### extends的配置包格式

其中，extends扩展的配置支持4种格式:

1. 单一配置文件地址, 可以填入绝对路径或相对路径: 'san-cli-config-xx'

2. 数组内多个配置文件: ['san-cli-config-x1', 'san-cli-config-x2']

3. 数组内除配置文件外还增加插件的开关控制对象: [['san-cli-config-xx', {mypluginId: false}]]

4. 数组内直接传入扩展的对象: [[{plugins: 'path/to/file'}, {mypluginId: false}]]

### extends支持加载配置对象

当 extends 数组的一项通过数组传入时，其第二个参数是整个配置包插件的配置对象，该对象的key是扩展的配置包内插件的id，值可以是：

- false，代表不加载该插件，当扩展了某些配置包，但其中某个插件需要大幅修改时，可以直接关闭包内的对应插件，自行定义插件处理
- 插件对应的配置值，在 extends 扩展插件包时传入的插件配置值，其优先级是高于包内插件默认的配置值，此对象可用于覆盖配置包内的默认值

> 此处注意，通过 extends 加载的插件配置对象，其格式与插件自身的配置对象格式相同，若插件有字段映射配置，则是 san.config.js 映射后的字段键值。

### 插件包的目录结构
san-cli-config-demo 的目录结构如下

```bash

├── plugins           # 插件
│   ├── common.js
│   ├── css.js
│   └── svgSprite.js
├── index.js          # 导出插件和配置对象
├── README.md
└── package.json

```

其中 `index.js` 导出包的配置对象，除包括扩展的plugins对象外，还可包括扩展插件的配置，例如：

```js
const resolve = require.resolve;
module.exports = {
    // 内置配置插件
    plugins: [
        resolve('./plugins/common'),
        resolve('./plugins/svgSprite'),
        resolve('./plugins/css')
    ],
    commonOption: 'myoption',
    cssOption: {...}
};

```

::: warning
extends 和 `san.config.js` 文件内同时含有插件时，会首先加载 extends 内的plugins，之后加载 `san.config.js` 内的 plugins，但在执行时，当两个plugin含有相同id时，则最后加载的 plugin 生效。其余配置项加载顺序也相同，即先 extends 后 `san.config.js` 的配置项，因此可以通过在 `san.config.js` 定义相同配置项来覆盖扩展包内的配置项。
:::

## 更多

如果想了解更多 Service 插件相关内容，那么请浏览[这个文档](./srv-plugin.md)。
