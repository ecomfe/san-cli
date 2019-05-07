# hulk-cli

手百前端 CLI (Command Line Interface)

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

-   默认 alias：
    -   init：new
    -   component：md
    -   serve：dev
-   `hulk.config.js`：hulk 的配置项目，包括 dev server 等
-   默认页面模板

### 默认的 alias

使用 alias 可以缩短代码，减少相对路径的使用，例如：

```js
import FooBar from '../../../../components/FooBar'; // Bad
import FooBar from '@/components/FooBar'; // Good
```

在 hulk CLI 项目中默认 alias 有：

-   `@` === 'src'
    所以项目中：

```js
import utils from '@/lib/utils';
// 相当于
import utils from 'src/lib/utils';
```

### `hulk.config.js`

项目中可以通过设置配置`hulk.config.js`，默认的`hulk.config.js`如下：

```js
{
    // css options
    css: {
        // modules = false, extract = isProd, sourceMap = true
    },
    // copy 相关，复制过来过去的，支持 [object({from,to,ignore})]/object({from,to,ignore})
    // copy:{}
    // loaders 配置
    loaderOptions: {
        // babel plugins
        // babel: {
        //     plugins: [require(xxx)]
        // }
        // postcss plugins
        // postcss:{
        //     plugins: [rquire(xxx), options]
        // }
    },
    // 生产环境配置
    production: {
        // 配置 cdn 路径
        // baseUrl: 'https://s.baidu.com/sbc/',
        // 打包 assets 路径
        // assetsDir: 'static',
        // 打包 template 路径
        // templateDir: 'template/webpack/profile',
        // 复制相关
        // copy: {
        //     from: './template',
        //     to: 'template/webpack/profile'
        // }
    }, // build 只会在 build 状态替换到默认的配置
    browserslist: {
        production: [
            '> 1.2% in cn',
            'last 2 versions',
            'iOS >=8', // 这里有待商榷
            'android>4.4',
            'not bb>0',
            'not ff>0',
            'not ie>0',
            'not ie_mob>0'
        ],
        development: ['> 1.2% in cn', 'last 2 versions', 'iOS 11']
    },
    // project deployment base
    baseUrl: '/',
    // where to output built files
    outputDir: 'output',
    templateDir: '',
    // where to put static assets (js/css/img/font/...)
    assetsDir: 'output',
    // filename for index.html (relative to outputDir)
    indexPath: 'index.html',
    // whether filename will contain hash part
    // multi-page config
    pages: undefined,
    plugins: [],
    // webpack chain, 可以添加 alias
    // chainWebpack: (config)=>{}
    // sev server middlewares ; use return function
    middlewares: [],
    devServer: {
        host: '0.0.0.0',
        port: 8899,
        https: false
    },
    chainWebpack:(webpackChainConfig)=>{}
};

```

#### build 配置

```js
// 生产环境配置，内部配置跟config 一级配置一样，会覆盖默认的一级同名配置
    build:{
        // 推荐使用 s.bdstatic.com CDN域名
        baseUrl: 'https://s.bdstatic.com/abc/',
        assetsDir: 'static',
        templateDir: 'template/abc',
        copy: {
            from: './template',
            to: 'template/abc'
        }
    },
```

#### 添加多页面应用

对于多页面可以使用下面的配置：

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

#### `hulk.config.js`的向上查找

默认`hulk.config.js`会从工作目录查找，找不到则向上查找，类似 node 模块查找顺序，利用这个特性可以给 component 文件夹下创建一个公共的`hulk.config.js`，这样子目录就可以查找到父目录的`hulk.config.js`了。

#### 给项目/单个页面增加 alias

在 profile 的 component 中的 less 文件，都引入了统一的`src/assets/core/index.less`，但是直接在`component`文件夹下执行 `hulk component docs/index.js`的时候，实际是找不到`src/assets/core/index.less`的，这时候可以通过`hulk.config.js`指定对应的 alias 即可，具体`hulk.config.js`配置如下：

```js
const path = require('path');

module.exports = {
    chainWebpack: config => {
        config.resolve.alias.set('@assets', path.resolve(__dirname, '../../assets'));
    }
};
```

这样，在 less 中可以使用`@assets`即可：

```less
@import '~@assets/core/index';
```

> Tips：添加 alias 要防止跟社区 scope 命名冲突。

## 默认**页面**模板

如果对 hulk 默认的 dev server 的 `index.html` 不能满足需求，可以在项目创建`public/index.html`来代替 hulk 内置的`index.html`，dev Server 会优先选择`public/index.html`作为页面模板。
