# Migrating from 1.x to 2.x

首先列出 Hulk2 的变化：

1. 内置 webpack，所有配置（包括 webpack、babel、postcss 等）都使用`hulk.config.js`；
2. html-webpack-plugin 做了修改，smarty 占位发生变化；
3. 支持 modern mode；
4. CSS 预处理器只支持 less！
5. 默认 dist 文件夹是 output；

## 0. 添加打包页面（entry）

多页面应用，使用`hulk.config.js`的`pages`，支持的配置项有：

-   entry：这个是 entry 的路径
-   template：可以是 tpl 和 html、ejs
-   filename：文件名
-   chunks：这里一般谨慎使用，否则可能导致页面资源缺失，默认的就够用了

```js
// 这是多页面配置
pages:{
    demoStore: {
        entry: './src/pages/demo-store/index.js',
        template: './template/demo-store/index.tpl',
        filename: 'demo-store/index.tpl'
    },
    index: {
        entry: './src/pages/index/index.js',
        template: './template/index/index.tpl',
        filename: 'index/index.tpl'
    }
}
```

## 1. 使用 alias

使用`hulk.config.js`中的`chainWebpack`进行扩展，**但是注意：不要设置太多 alias，会导致项目依赖 hulk.config 过重，而增加迁移成本，另外也要注意不要跟 npm scope 命名冲突**

```js
chainWebpack: config => {
    // 这里可以用来扩展 webpack 的配置，使用的是 webpack-chain 语法
    config.resolve.alias
        .set('@assets', resolve('src/assets'))
        .set('@components', resolve('src/components'))
        .set('@native', resolve('src/native'))
        .set('@app', resolve('src/lib/App'))
        .set('@store', resolve('src/lib/Store'));
};
```

> Tips：`hulk.config.js`中的`chainWebpack`是接受一个[webpack-chain](https://github.com/neutrinojs/webpack-chain)`config`对象

## 2. smarty 没有引入 js 和 css 资源，占位符问题

在 smarty 模板中，需要添加下面的`block`，html-webpack-plugin 的插件会匹配内容，将打包出来的 js 和 css 放到对应的 head 和 body 中去！

> 注意：`<head></head>`和`<body></body>`必须要填写，html-webpack-plugin 会查找这个标签，添加上 js 和 css，处理完之后，只起到了占位的作用；hulk 在最后使用插件，将这俩标签去掉。

```
{%block name="__head_asset"%}<head></head>{%/block%}
{%block name="__body_asset"%}<body></body>{%/block%}
```

如果有模板继承关系，别忘了在父模板中将对应的 block 放到合适的位置！

## 3. 修改 postcss 插件配置

`hulk.config.js`中的`loaderOptions`配置是给对应 loader 设置 options 的，postcss 内置的插件包括：

-   pr2rem;
-   import;
-   autoprefixer;

```js
loaderOptions:{
    postcss: {
        builtInPluginConfig: {
            'pr2rem': {
                rootValue: 10000
            }
        }
    }
},
```

## 4. 添加 postcss 插件

```js
loaderOptions:{
    postcss: {
        plugins: [[plugin, options]]
    }
},
```

## 5. 添加 babel 插件

```js
loaderOptions: {
    babel: {
        plugins: [
            require('@babel/plugin-transform-modules-commonjs'),
            [
                require('@babel/plugin-transform-runtime'),
                {
                    // corejs: false, // 默认值，可以不写
                    regenerator: false, // 通过 preset-env 已经使用了全局的 regeneratorRuntime, 不再需要 transform-runtime 提供的 不污染全局的 regeneratorRuntime
                    helpers: true, // 默认，可以不写
                    useESModules: false, // 不使用 es modules helpers, 减少 commonJS 语法代码
                    absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json'))
                }
            ]
        ];
    }
}
```

## 6. hulk.config.js 的向上查找

`hulk.config.js`是使用[cosmiconfig](https://github.com/davidtheclark/cosmiconfig)来查找的，所以类似 node_modules 模块的向上查找逻辑，所以在执行目录不存在`hulk.config.js`文件，那么会向上一级目录查找是否存在，直到根目录找不到使用默认配置。

利用这个特性，可以对一些类似 components 目录进行统一配置，例如在 components 目录下设置一个公共的`hulk.config.js`，这样 components 的每个组件目录都不需要单独设置了，因为会向上一级目录查找`hulk.config.js`文件。

## 7. 查看 webpack 配置

`hulk inspect`可以查看 webpack 的配置，`hulk inspect -h`可以查看帮助

## 8. 查看 analyze 打包分析

`hulk build --analyze`

## 9. 执行 lint

`hulk lint`

## 10. modern mode（内测）

`hulk build --modern`，会打包两次，第一次生成 legacy 文件，第二次生成 modern 文件，然后使用 html-webpack-plugin 的插件在 html 中进行资源聚合。

## 11. preload 和 prefetch

使用 webpack 神奇注释的资源，会在 head 中[预取](https://medium.com/reloading/preload-prefetch-and-priorities-in-chrome-776165961bbf)

```js
/*webpackPreload: true*/
/*webpackPrefetch: true*/
```

## 12. 使用 build 属性来做生产环境打包配置

为了方便生产环境打包配置，`hulk.config.js`增加`build`属性，来做生成环境打包，在`mode=production`下，会使用`build`覆盖掉对应的默认配置：

```js
build:{
    baseUrl: 'https://s.bdstatic.com/homepage',
    assetsDir: 'static',
    templateDir: 'template/webpage/',
    copy: {
        from: './template',
        to: 'template/webpage'
    }
},
sourceMap: false,
// 不复制 publicDir
copyPublicDir: false,
baseUrl: '/',
// where to output built files
outputDir: 'dist',
```

上面的配置，`mode=production`时候，`baseUrl`、`assetsDir`等都从`build`取值。

## 13. 复制内容到 dist 文件夹

使用 copy 啊！只是对象和数组：

```js
copy: {
        from: 'template',
        to: 'template'
    }
```

配置项参考 [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin)
