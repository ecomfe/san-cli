# hulk-cli

手百前端CLI (Command Line Interface)

## 安装

```bash
npm i -g @baidu/hulk-cli --registry http://registry.npm.baidu-int.com
```
## 使用

```bash
# 查看帮助
hulk -h
# 初始化项目模板
hulk init <template-name> <project-name>
# 默认 san 项目模板
hulk init project <folder>
# 初始化组件模块
hulk init component <component-folder>
# 启动单页 dev server
hulk serve <san-or-js-file>
# 组件开发 dev server
hulk component docs/index.js
```

#### 例如

```bash
# 支持 vuejs-template github 增加github:
hulk init github:vuejs-templates/simple demo
# 默认是从 icode repo 安装
# 安装 baidu/hulk/simple 这个 repo到 demo 文件，可以使用：
hulk init simple demo
# 分支写法
hulk init name#branch demo
# 更多用法查看帮助
hulk --help
hulk <command> --help
```

安装模板后会自动安装依赖文件。

## 配置
hulk 支持多个配置，具体包括：

* 默认 alias
* `hulk.config.js`/`package.json` hulk 字段：hulk 的配置项目，包括 dev server 等
* 默认页面模板
* postcss配置


### 默认的 alias
使用 alias 可以缩短代码，减少相对路径的使用，例如：

```js
import FooBar from '../../../../components/FooBar' // Bad
import FooBar from '@/components/FooBar'           // Good
```

在 hulk CLI 项目中默认 alias 有：

* `@` === 'src'
所以项目中：
```js
import utils from '@/lib/utils'
// 相当于
import utils from 'src/lib/utils'
```

### `hulk.config.js`和`package.json`的 hulk 字段
项目中可以通过设置配置`hulk.config.js`和`package.json`的 hulk 字段来对项目进行配置，默认的`hulk.config.js`如下：

```js
{
    // project deployment base
    baseUrl: '/',

    // where to output built files
    outputDir: 'dist',

    // where to put static assets (js/css/img/font/...)
    assetsDir: '',

    // filename for index.html (relative to outputDir)
    indexPath: 'index.html',

    // whether filename will contain hash part
    filenameHashing: true,

    // boolean, use full build?
    runtimeCompiler: false,

    // deps to transpile
    transpileDependencies: [
        /* string or regex */
    ],

    // sourceMap for production build?
    productionSourceMap: !process.env.HULK_CLI_TEST,

    // use thread-loader for babel & TS in production build
    // enabled by default if the machine has more than 1 cores
    parallel: () => {
        try {
            return require('os').cpus().length > 1;
        } catch (e) {
            return false;
        }
    },

    // multi-page config
    pages: undefined,

    // <script type="module" crossorigin="use-credentials">
    // #1656, #1867, #2025
    crossorigin: undefined,

    // subresource integrity
    integrity: false,

    css: {
        // extract: true,
        // modules: false,
        // localIdentName: '[name]_[local]_[hash:base64:5]',
        // sourceMap: false,
        // loaderOptions: {}
    },

    devServer: {
        /*
      open: process.platform === 'darwin',
      host: '0.0.0.0',
      port: 8080,
      https: false,
      hotOnly: false,
      proxy: null, // string | Object
      before: app => {}
    */
    },
    chainWebpack:(webpackChainConfig)=>{},
    configureWebpack: (webpackConfig)=>{}
}
```
#### 给项目/单个页面增加 alias
在 profile 的 component 中的less 文件，都引入了统一的`src/assets/core/index.less`，但是直接在`component`文件夹下执行 `hulk component docs/index.js`的时候，实际是找不到`src/assets/core/index.less`的，这时候可以通过`hulk.config.js`指定对应的 alias 即可，具体`hulk.config.js`配置如下：

```js
const path = require('path');

module.exports = {
    chainWebpack: config => {
        config.resolve.alias.set(
            '@assets',
            path.resolve(__dirname, '../../assets')
        );
    }
};
```
这样，在 less 中可以使用`@assets`即可：

```less
@import '~@assets/core/index';
```

## 默认**页面**模板
如果对 hulk 默认的 dev server 的 `index.html` 不能满足需求，可以在项目创建`public/index.html`来代替 hulk 内置的`index.html`，dev Server 会优先选择`public/index.html`作为页面模板。

## `postcss.config.js`

postcss 是一个 css 的 AST 工具，通过它可以用 JavaScript 对 css 进行编辑和批量处理，比如随机 id/class 等需求都可以通过编写 postcss 来实现。这里项目主要用了 postcss 的 `autoprefixer`和`pr2rem`，其他插件根据实际情况配置，对应的配置文件为：`postcss.config.js`

对于项目中使用 postcss 进行 css 处理的时候，可以通过配置`postcss.config.js`来完成 postcss 的配置。**注意：需要同时安装 postcss 插件的 npm 包**
