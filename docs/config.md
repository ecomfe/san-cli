# san.config.js

## 默认配置如下

```js
module.exports = {
    pages: undefined,
    outputDir: 'output',
    assetsDir: '',
    publicPath: '/',
    filenameHashing: false,
    devServer: {
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

### env 相关

`browserslist` 浏览器兼容情况，babel-loader 中 targets 的 browsers 设置值（如果没有此配置项就从 package.json 中取 browserslist 设置值）。 _Array_

###### **_例如_**

```js
browserslist: [
    '> 1.2% in cn',
    'last 2 versions',
    'iOS >=8',
    'android>4.4',
    'not bb>0',
    'not ff>0',
    'not ie>0',
    'not ie_mob>0'
];
```

`jsonpFunction` output 的 jsonpFunction 设置值，默认值为 HK3。 _String_

`transpileDependencies` 需要编译的 es6 模块（默认是不编译 node*modules 模块的，所以如果模块是 es6 可以在此处配置使 babel 编译，此方式有利于 Tree-Shaking）。 \_Array 数组项为 String 或 RegExp*

###### **_例如_**

```bash
transpileDependencies: ['@baidu/xbox', '@baidu/xbox-na', /@baidu/]
```

### 产出相关

`pages` 多页面配置。 _Object {页面名称：{页面配置项}}_ 页面配置项（为 HtmlWebpackPlugin 中的相应配置项）如下：

------ `entry` 页面入口文件相对地址。 _String 或 Array 数组项为 String_

------ `template` 页面模板文件相对地址。 _String_

------ `filename` 页面模板文件产出地址。 _String_

------ `title` 用于生成的 HTML 文档的标题。 _String_

------ `chunks` 允许插入到模板中的一些 chunk，不配置此项会默认将 entry 中所有的 chunk 注入到模板中；如果配置，需要跟 mode 里面的 splitChunks 遥相呼应。 _String 或 Array 数组项为 String_

###### **_例如_**

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

`copy` 模板拷贝。 _Object 或 Array 数组项为 Object_

------ `from` 拷贝模板的源路径。 _String_

------ `to` 拷贝模板到 outputDir 中的目标路径。 _String_

------ `compress` 模板内联 js、css 是否压缩，默认为 true。 _Boolean_

------ `ignore` 忽略的模板路径，不会被拷贝。 _String 或 RegExp_

###### **_例如_**

```js
copy: {
    from: 'template',
    to: 'template/gem-h5/page'
}
```

```js
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
```

`outputDir` 产出目录地址。 _String_

###### **_例如_**

```bash
outputDir: 'ouput'
```

`assetsDir` 静态文件 outputDir 中的产出目录地址。 _String_

###### **_例如_**

```bash
assetsDir: 'static/gem-h5'
```

`publicPath` 指定在浏览器中引用时输出目录的公共 URL，此选项的值在大多数情况下以`/`结尾。 _String_

```bash
publicPath: '/'
```

### service 插件相关

`plugins` 增加自定义插件。 _Object 或 Array 数组项为 Object_

###### **_例如_**

```bash
plugins: [
    {
        id: 'built-in:plugin-progress',
        apply(api, projectOptions, options = {}) {
            api.chainWebpack(webpackConfig => {
                options.color = require('@baidu/san-cli-utils/randomColor').color;
                webpackConfig.plugin('progress').use(require('webpackbar'), [options]);
            });
        }
    },
    {
        id: '插件 id',
        apply(api, projectOptions, options = {}) {
            ...
        }
    }
    ...
]
```

### 生产环境优化相关

`sourceMap` 产出是否生成 sourceMap。 _Boolean_

`filenameHashing` 产出文件是否加 hash 值。 _Boolean_

### css 相关

`css` css 编译相关配置项。 _Object_

------ `cssnanoOptions` optimize-css-assets-webpack-plugin 中的 cssProcessorOptions css 压缩配置项。 _Object_

------ `cssPreprocessor` css 编译白名单，值只能为'less', 'sass', 'styl', 'stylus', 'scss'，例如写了 less，那么只编译 less、css 代码，默认全编译。 _String_

###### **_例如_**

```bash
cssPreprocessor: 'less'
```

------ `extract` 是否提取 css 代码到产出文件中。 _Boolean_

------ `sourceMap` 产出是否生成 sourceMap，默认与外层的 sourceMap 值一样。 _Boolean_

------ `requireModuleExtension` 是否不使用 css module，默认是使用的。 _Boolean_

------ `loaderOptions` loader 配置项。 _Object_

------------ `css` 需要新增的 css-loader 配置项。 _Object_

------------ `sass` 需要新增的 sass-loader 配置项。 _Object_

------------ `less` 需要新增的 less-loader 配置项。 _Object_

------------ `stylus` 需要新增的 stylus-loader 配置项。 _Object_

------------ `postcss` 需要新增的 postcss-loader 配置项。 _Object_

### webpack 相关

`alias` 新增 resolve.alias 配置项。 _Object_

###### **_例如_**

```bash
alias: {
    'assets': 'src/assets'
}
```

`loaderOptions` 新增 loader 配置项。 _Object_

`splitChunks` 新增 optimization.splitChunks 配置项。 _Object_

`chainWebpack` 用来扩展 webpack 的配置，使用的是 webpack-chain 语法。 _Function_

###### **_例如_**

```bash
chainWebpack: config => {
    config.resolve.alias
        .set('@assets', resolve('src/assets'))
}
```

`configWebpack` 扩展 webpack 的配置。 _Function 或 Object_

`devServer` webpack devServer 配置项。 _Object_
