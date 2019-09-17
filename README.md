# Hulk cli - 前端研发命令集

## Hulk 3.0 roadmap

Hulk2 已经满足手百 San 日常开发功能，但是在插件化和可扩展性做的不够好，因此启用 Hulk3 项目，旨在做可定制化的前端开发工具集，不再局限 San 的应用，而是做到通用化配置。所以整体规划如下：

0. 继续使用 lerna 做包管理，拆包如下：
    1. cli：hulk-cli 的实例实现
        1. commands：符合 [yargs command API](https://github.com/yargs/yargs/blob/master/docs/api.md#commandcmd-desc-builder-handler)
            1. default：是最后兜底的命令，用于扩展 hulk 命令
            2. yargs command handler 接受的 argv 会通过 middleware 机制添加通用的属性方法，例如统一的 log
    2. core：lib 类和工具函数，webpack 核心 service 实现
        1. lib：类目录
            1. HError
            2. pluginAPI
            3. Service
        2. configs：webpack buildin 配置
        3. argsert：入参 assert 判定
        4. ttyLogger：chalk 等终端 console 封装
    3. command-component：实现 component 命令，对标 hulk2 的 component 开发
    4. hulk-sbox：针对手百内容进行配置订制，对标 Hulk2
    5. plugin-deploy：支持内部 deploy 方案（类似 fis）
    6. plugin-sentry：类似 hulk build --sentry 支持
    7. plugin-yapi：针对 yapi mock proxy 做支持
    8. plugin-smarty：针对 smarty 做支持
    9. plugin-modern：modern mode
1. 基于 yargs 实现 command 机制，基础 Command 命令包括：
    1. init：脚手架工具（alias create）
    2. serve、build：基于 Webpack chain 的 webpack 配置，内置了部分 config，增加 Service 和 PluginAPI 作为插件化；
    3. inspect：用于检视 webpack config 内容。
1. 插件化设计：
1. 统一日志设计：
1. 事件流（生命周期）：
1. UI 支持（优先级低）：
1. 私有 hulk-sbox 由一份内置 hulk.config.js 配置而成

### Hulk3 插件机制设计

整个 Hulk3 的打包部分由 Service 驱动，插件通过传入 PluginAPI 实例来实现扩展，PluginAPI 的重要 API 如下：

-   `getVersion()`、`getLogger()`、`getCwd()`、`getProjectOptions()`：获取 hulk 版本、npmlog 对象、cwd、最终配置；
-   `registerCommand(cmd, yargsCommandArgs)`：注册命令;
-   `chainWebpack(webpackConfig)`：传入 Webpack-chain 的 API
-   `on()`：监听生命周期，获取对应的产出

#### 插件编写

```js
module.exports = {
    id: 'name',
    apply (api, options)=>{},
    // ui 设计待定
    ui(){}
}
```

### Hulk3 统一日志设计

Hulk3 中统一使用 npmlog ，`hulk`命令支持 flag `--logLevel`，可以传入`'info', 'debug', 'warn', 'error', 'silent', 'notice', 'silly', 'timing', 'http'`，

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

> PS：`hulk`的 flag `--verbose`实际等于`--logLevel info`


### Hulk3 事件流设计（非必须）
目前 PluginAPI 中有`on`和`emit`两个方法，但是事件待设计

### Hulk3 UI 设计
待设计


### Hulk3 hulk.config.js

* pluginMethods：提供给 plugin 调用的方法
*

## Hulk 2.0

解决问题：

1. 发现大家在使用 Hulk-CLI 创建了项目之后，需要升级配置的时候，需要挨个升级，很是麻烦；
2. 而且之前的脚手架存在多处配置问题，需要重新设计下架构；
3. 纳入 lint 命令；
4. 扩展 hulk.config.js；
5. 增加 modern mode 打包；
6. 拆分 loader 和 plugin，修复设计不合理的地方，比如 markdown-loader 配置问题，不支持模板定制问题。

![](./roadmap-2.0.png)

## 开发

```bash
lerna bootstrap
```

## 发布

```bash
lerna publish --skip-git
```

## 测试

```bash
node packages/@baidu/hulk-cli/bin/hulk.js
```

## 二次编写

在 `packages/hulk-cli/commands/*` 添加命令，然后在`packages/hulk-cli/bin/hulk.js`添加入口，参考下面目录：

```
commands
├── init # 新增命令
│   ├── index.js # commander 配置
│   └── run.js   # action 实际代码
```

`index.js` 主要是 [commander](https://www.npmjs.com/package/commander) 配置

```js
// index.js 主要是 commander 配置，接收program配置
const run = require('./run');
module.exports = program => {
    program
        .command('update [path]')
        .description('执行npm outdated，升级目录下面的依赖')
        .allowUnknownOption()
        .action(run);
};
```

`run.js` 是项目实际的代码，接收`commander` `action`参数

> `run.js` 推荐用 import-lazy 来引入模块，尽量避免一开始就执行，不然会拖累 cli 的执行速度

## 远程部署

### config 配置

在 Hulk.config.js 中配置 deployMap 字段

```
 // receiver等字段参考fis的配置方式，示例如下

 deployMap: {
    ...
    sandbox: {
        receiver: 'http://fe.fis.searchbox.otp.baidu.com/fis/receiver',
        templatePath: '/home/work/orp',
        staticPath: '/home/work/orp/nginx.static/htdocs',
        staticDomain: 'http://yq01-wyneeyue.epc.baidu.com:8888'
    },
    ...
    anotherSandbox: {
        receiver: 'http://fe.fis.searchbox.otp.baidu.com/fis/receiver',
        templatePath: '/home/work/orp',
        staticPath: '/home/work/orp/nginx.static/htdocs',
        staticDomain: 'http://yq01-wyneeyue.epc.baidu.com:8888'
    },
    ...
 }

```

### 执行命令

在 build 命令中添加，`-r`(或`--remote`)参数，值为`deployMap`中的 key

```
hulk build --config hulk.config.js -r sandbox
```

这样就能把 build 的编译产物推送到远程机器了
