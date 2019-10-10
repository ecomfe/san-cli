## San-CLI Roadmap

Hulk2 已经满足手百 San 日常开发功能，但是在插件化和可扩展性做的不够好，因此启用新的 CLI 开发计划，该 CLI 旨在完善 San 生态，做可定制化的前端开发工具集，在兼顾 San 生态的同时，遵守微核心和插件化的设计思想，尽量不局限 San 的应用，做到通用化配置。

### 具体要求和功能点如下

1. 核心功能实现：
    1. commander 实现：
        1. 使用 yargs 做 commander，根据 middleware 机制添加通用属性和方法
        2. 支持插件注册命令
        3. 支持插件扩展命令 flag
        4. 支持根据 flag 跳过 meta 问题答案，例如`san init xxx --useESLint false`则，脚手架中 meta.js 的`useESLint`部分可以直接跳过并赋值
    2. 插件机制设计采用 Service 机制
    3. 统一封装日志，使用 npmlog
    4. 统一错误类型
    5. 重要函数统一入参判断，参数不对增加报错提示
    6. 统一 tty 终端 console 封装
    7. 单测机制
2. 环境配置：`.env`：
    1. 用途：用于环境变量相关配置，会绑定到`process.env`上；
        1. 例如 deploy 可以使用`.env.local`的配置将构建之后的产出部署到开发机
    2. 支持`.env.local`和`.env.[mode]`、`.env.[mode].local`类型
    3. 读取时机：yargs 执行前
3. CLI 配置`.sanrc`，这里主要是一些 CLI 的预置项：
    1. 用途：可以作为 commander 扩展和`.configs`会`san.config.js`默认项等：
        1. 提前声明 plugin 及其配置
        2. 提前声明支持的 commander 和 flag
        3. 项目默认配置，例如`cssPreprocessor`
    2. 使用`schema`检查语法；
    3. 读取时机：yargs 执行之前，解析自定义 commands 和 flags 生成 yargs 配置项
4. 项目配置`san.config.js`：
    1. 用途：主要是项目配置相关，比如 `dev-server`、`pages`等
    2. 使用`schema`检查语法
    3. 读取时机： service 实例化之时
5. 脚手架：
    1. 支持 Github、gitlab、icode 等三方 repo 下载 template 安装
    2. 脚手架支持根据 meta.js 安装
6. Webpack 相关
    1. build 和 serve 命令支持
    2. Service 设计
    3. PluginAPI 设计
    4. 项目配置 san.config.js 加载
    5. 基础配置：
        1. postcss，注意 postcss config
        2. style：css/less/sass/styl
        3. html 配置，支持多页面根据 chunk
        4. 其他：progress、sourcemap、svg、url、media、fonts 等
    6. 优化部分：
        1. splitChunk 默认优化
        2. 压缩
    7. dev-server 配置
        1. 跟 san.config.js 配置项打通
        2. proxy 支持
        3. hmr
7. 插件部分：
    1. 内置插件
        1. babel 相关配置
        2. 打包结果 Stats 分析，单独一个 webpack plugin
        3. lint 相关：eslint（规则）、fecs
        4. build 扩展：
            1. `--modern`：modern mode 打包
            2. `--target`：用于 San 组件（nano 流程）和类似`xbox-sdk`的发包构建，支持`component`、`lib`
    2. 非内置插件
        1. 部署：build 和 serve 支持 `--deploy`，deploy 配置项
        2. yapi 支持：dev server 可以配置 proxy 到 yapi
        3. smarty：针对 smarty tpl 页面进行处理
            1. html-plugin 插件支持 tpl 中资源管理，script、style 压缩
            2. tpl+dev-server 支持，使用 php 执行 smarty
            3. preload 和 prefetch 等支持
        4. component 命令支持组件化开发：hulk2 的 san 组件功能
            1. 支持本地 dev server 查看 markdown 预览
        5. martix：build 和 serve 支持 `--martix`打包，即 martix-loader
8. 更新检测使用 update-notify
9. inspect 命令：
10. 支持输出全部
11. 支持 plugin 和 loader 配置查询
12. UI 支持：优先级低，暂无详细设计，插件部分会预留接口

### 插件机制设计

整个 CLI 的打包部分由 Service 驱动，插件通过传入 PluginAPI 实例来实现扩展，PluginAPI 的重要 API 如下：

-   `getVersion()`、`getLogger()`、`getCwd()`、`getProjectOptions()`：获取 CLI 版本、npmlog 对象、cwd、最终配置；
-   `registerCommand(cmdName, handler)`：注册命令;
-   `chainWebpack(webpackConfig)`：传入 Webpack-chain 的 API
-   `on()`：监听生命周期，获取对应的产出

#### 插件编写

```js
module.exports = {
    id: 'name',
    // 命令相关，会在 service 实例化之后，具体来 run 对应的命令
    // 这里作用：1. 用于 yargs 展现help 信息；2. 用于 service.run 具体的命令；
    // 此处增加的 cmd 命令，比如在`apply`中使用`api.registerCommand`传入对应的 handler
    // 这样可以保证`service.run(cmdName)`时可以找到对应的 handler
    commands: {
        cmdName:{
            desc,
            builder
        }
    },
    // 这里是给现有命令添加自定义 flag 说明，例如给 build 增加`--target`
    // 使用的时候可以使用 build 的 argv 对象
    // 用于 help 说明而已
    flags: {
        build: {
            modern:'生成 modern 代码'
        }
    },
    apply (api, projectOptions, pluginOptions)=>{},
    // ui 设计待定，预留
    ui(){}
}
```

### 统一日志设计

统一使用 npmlog ，`CLI`命令全部支持 flag `--logLevel`，可以传入`'info', 'debug', 'warn', 'error', 'silent', 'notice', 'silly', 'timing', 'http'`，

在插件中可以通过`api.getLogger()`获取 npmlog 实例：

```js

module.exports = {
    apply(api)=>{
        const log = api.getLogger();

        // additional stuff ---------------------------+
        // message ----------+                         |
        // prefix ----+      |                         |
        // level -+   |      |                         |
        //        v   v      v                         v
            log.info('fyi', 'I have a kitty cat: %j', myKittyCat)
    }
}

```

> PS：`CLI`的 flag `--verbose`实际等于`--logLevel info`

### 事件流设计（非必须）

目前 PluginAPI 中有`on`和`emit`两个方法，但是事件待设计

### UI 设计

待设计

### `.sanrc`详细配置项

- plugins
- configs
- cssPreprocessor



### san.config.js 详细配置项

- pages
- outputDir
- assetsDir
- publicPath
- devServer
- chainWebpack
- configureWebpack
- css
- css.loaderOptions
- css.sourceMap
- pluginOptions
- productionSourceMap
