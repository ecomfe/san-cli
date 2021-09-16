

# San CLI 配置文件

San CLI 的配置文件为`san.config.js`，该文件放在项目的根目录下，当执行 San CLI 命令的时候，CLI 会自动读取 san.config.js 的内容，当然我们也支持传入 Config 文件，当使用 CLI 的时候，使用`--config`传入自定义的 Config 文件路径即可。

## 默认配置如下

`san.config.js`的内容是一个 Node.js 的 CommandJS 格式，默认配置是：

```js
module.exports = {
    pages: undefined,
    outputDir: 'output',
    assetsDir: '',
    publicPath: '/',
    filenameHashing: false,
    devServer: {
        watchContentBase: false,
        hot: true,
        hotOnly: false,
        logLevel: 'silent',
        clientLogLevel: 'silent',
        overlay: {warnings: false, errors: true},
        stats: 'errors-only',
        inline: false,
        lazy: false,
        index: 'index.html',
        watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
            poll: 100
        },
        disableHostCheck: true,
        compress: false,
        host: '0.0.0.0',
        port: 8899,
        https: false
    },
    sourceMap: false
};
```

## 配置项

下面来详细说下配置项。

### 页面和产出相关配置

#### `pages`

多页面配置，为页面配置项（为 html-webpack-plugin 中的相应配置项）如下：

```js
module.exports = {
    pages: {
        entry: '',
        template: '',
        filename: '',
        title: '',
        chunks: []
    }
};
```

主要配置项说明如下：

-   `entry` 页面入口文件相对地址。 _String 或 String[]_
-   `template` 页面模板文件相对地址。 _String_
-   `filename` 页面模板文件产出地址。 _String_
-   `title` 用于生成的 HTML 文档的标题。 _String_
-   `chunks` 允许插入到模板中的一些 chunk，如果在 splitChunks 里配置了拆包，就需要把拆的包的名字添加到这里。 _String[]_

> 这里的 pages 内的配置项除了 entry 为特殊指定的 Webpack `entry`外，其他的都是 html-webpack-plugin 的配置项。

**例如**

```js
pages: {
    index: {
        entry: './src/pages/index/index.js',
        template: './template/index.tpl',
        filename: 'index.tpl',
        chunks: ['common', 'vendors']
    },
    ...
}
```

#### `copy`

San CLI 内置了[copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin)，并且在配置中使用`copy`来进行配置：

`copy` 模板拷贝。 _Object 或 Object[]_

-   `from` 拷贝模板的源路径。 _String_
-   `to` 拷贝模板到 outputDir 中的目标路径。 _String_
-   `compress` 模板的内联 js、css 是否压缩，默认为 true。 _Boolean_
-   `ignore` 忽略的模板路径，不会被拷贝。 _String 或 RegExp_

**例如**

```js
module.exports = {
    copy: {
        from: 'template',
        to: 'template/gem-h5/page'
    }
};
// 也支持数组：
{
    copy: [
        {
            from: 'template',
            to: 'template/gem-h5/page'
        },
        {
            from: 'hybrid',
            to: 'template/gem-h5/hybrid',
            ignore: /md/
        }
    ];
}
```

#### `outputDir` 产出目录

`outputDir` 是产出目录地址。

**例如**

```bash
module.exports = {
    outputDir: 'ouput'
}
```

#### `assetsDir`静态资源路径

`assetsDir` 是静态文件 outputDir 中的产出目录地址。

**例如**

```js
module.exports = {
    assetsDir: 'static/gem-h5'
};
```

这样打包出来的静态资源（图片、字体、音视频等）会被放到`outputDir/assetsDir`路径中。

#### `publicPath` 引用的公共 URL

`publicPath` 指定在浏览器中引用时输出目录的公共 URL，此选项的值在大多数情况下以`/`结尾。

```js
module.exports = {
    publicPath: '/'
};
```

> 常用的方式是将静态资源放到 CDN，那么可以配置`publicPath`为 CDN 的路径。

### 生产环境优化相关

1. sourcemap：js 的 sourcemap 使用`sourceMap`，css 的使用`css.sourceMap`；
2. filenameHashing：给文件名添加 hash 值；
3. largeAssetSize：小于这个配置的图片和文件会被编译成 base64 放到 css 中。

**例如**

```js
module.exports = {
    sourceMap: true,
    css: {
        sourceMap: true
    },
    filenameHashing: true,
    largeAssetSize: 4e3
};
```

### webpack 相关

#### `alias`

alias 是 Webpack 的 `resolve.alias` 配置项。
**例如**

```js
module.exports = {
    alias: {
        '@assets': 'src/assets'
    }
};
```

#### `loaderOptions`

在 San CLI 中内置很多 Loader，都有默认配置，如果需要修改默认配置可以使用`loaderOptions`，其中 css 中的 loader（例如 style-loader 、css-loader 等）则可以通过`css.loaderOptions`进行修改，例如：

**例如**

```js
module.exports = {
    //...
    loaderOptions: {
        babel: {
            plugins: [
                [
                    // @baidu/nano的按需引入
                    require.resolve('babel-plugin-import'),
                    {
                        libraryName: '@baidu/nano',
                        libraryDirectory: 'es',
                        style: true
                    }
                ]
            ]
        }
    }
};
```

> 注意：`san-cli-plugin-babel` 在 < 2.02版本时，默认内置了 `@babel/plugin-transform-modules-commonjs` 将代码转换为commonjs后再处理，版本 >= 2.02中已移除该插件，已有代码库如出现模块引入问题可按照如下方式将此插件增加至babel

```js
module.exports = {
    //...
    loaderOptions: {
        babel: {
            plugins: [
                ...
                '@babel/plugin-transform-modules-commonjs'
            ]
        }
    }
};

```

::: warning
但是，我们推荐使用`babel.config.js`或者`.babelrc`进行 Babel 配置。
:::

其他可在`loaderOptions`中配置的选项：

-   `image` 用于修改图片的 url-loader 的默认配置项
-   `thread` 需要在生产环境下开启多进程打包的 thread-loader 的配置项，thread 传入 true 可开启，还可传入[thread-loader](https://webpack.js.org/loaders/thread-loader/)的配置对象，替换默认配置。例如：
    ```js
    module.exports = {
        // ...
        loaderOptions: {
            thread: true // 或填入 {}
        }
    };
    ```
-   `san` 需要修改的 `san-loader` 的配置项，注意当 `san-loader` 开启 `{esModule: true}` 时，需同时将 `loaderOptions.html` 设置为 `{esModule: true}`

### css 相关

San CLI 中跟 CSS 相关的配置都统一放置在`css`中。例如：

```js
module.exports = {
    css: {
        // css 相关配置
    }
};
```

下面来说下相关的配置。

#### `cssPreprocessor`

`css.cssPreprocessor` css 预处理器白名单，值只能为 'less'、'sass'、'styl'、'stylus' 或 'scss'，例如写了 less，那么只编译 less、css 代码，默认全编译。

**例如**

```js
module.exports = {
    css: {
        cssPreprocessor: 'less'
    }
};
```

::: warning
推荐根据项目实际情况进行配置，这样只会添加对应的 loader。
:::

#### `extract`

`extract` 是否提取 css 代码到产出文件中，在 production 情况下是 true，在 development 情况下是 false。

#### `sourceMap`

产出是否生成 sourceMap，默认与外层的（js 的 sourceMap） sourceMap 的值一样。

#### `loaderOptions`

css 相关的 loader 配置项，支持：

-   `css` 需要新增的 css-loader 配置项；此处还可以修改 css modules 的相关配置（[css-loader](https://github.com/webpack-contrib/css-loader#modules)）
-   `sass` 需要新增的 sass-loader 配置项；
-   `less` 需要新增的 less-loader 配置项；
-   `stylus` 需要新增的 stylus-loader 配置项；
-   `postcss` 需要新增的 postcss-loader 配置项，默认支持 postcss.config.js 的配置。

**例如** 所有样式文件均应用css modules

```js
module.exports = {
    css: {
        sourceMap: isProduction,
        cssPreprocessor: 'less',
        loaderOptions: {
            css: {
                modules: {
                    auto: () => true
                }
            }
        }
    }
};
```

::: warning
当使用的san-cli版本 >= 4.1.0时，默认less版本是4.1.1， less-loader版本10.0.1，若工程中需要引用 less 3.x less-loader 5.x时，尤其是需要使用`javascriptEnabled`特性，则需要按照以下参数传入配置：
:::

```js
module.exports = {
    css: {
        cssPreprocessor: 'less',
        loaderOptions: {
            less: {
                javascriptEnabled: true,
                compress: false
            }
        }
    }
};
```

::: warning
这里介绍的是一般配置，更多高级的配置以及优化相关的配置可以继续阅读[高级配置](./advanced.md)内容。
:::
