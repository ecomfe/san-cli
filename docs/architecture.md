---
title: 内部实现
---

# 内部实现

San CLI 是一个命令行工具，其次它是一个内置 Webpack 的前端工程化构建工具。San CLI 在架构设计上采取了微核心和插件化的设计思想，我们可以通过插件机制添加命令行命令，还可以通过插件机制定制 Webpack 构建工具，从而满足不同 San 环境的前端工程化需求。

San CLI 在兼顾 San 生态的同时，尽量做到通用化配置，在设计之初，我们希望不局限于 San 的应用范畴，做可定制化的前端开发工具集。

下面分别从模块、命令行实现、脚手架和插件机制四大方面来介绍下 San CLI 的内部实现。

## 核心模块介绍

San CLI 的核心模块包含：

-   san-cli：核心模块，负责组装整个工作流程和实现核心功能
-   san-cli-utils：工具类
-   san-cli-webpack：webpack build 和 dev-server 通用逻辑和 webpack 自研插件等

### san-cli-utils 重点方法介绍

utils 中用的最多的是`ttyLogger.js`中跟 tty 输出相关的函数，常见的有：

-   ora
-   chalk
-   logger
    -   log
    -   debug
    -   info
    -   done/success
    -   warning/warn
    -   error
    -   fatal
    -   time/timeEnd：用于检测时间段耗时，需要配合`SAN_DEBUG=1`环境变量使用

San CLI 中的 logger 是通过自定义的 Consola Reporter 实现的，在插件中也可以直接调用这些方法使用。

> San CLI 的终端配色是随机的，如果要使用彩色突出显示终端内容，强烈建议使用`randomColor.js`中的`textColor`和`bgColor`两个方法。

### san-cli-webpack 模块介绍

为了方便 Webpack 打包命令和 dev-server 相关的代码逻辑复用，我们将`build`和`serve`用到的两个方法进行了统一封装。这俩方法是`promisify`的。除此之外改模块还包含了下面 Webpack 相关插件：

-   `lib/formatStats.js`：在`build` 之后分析`Stats`对象，在终端中输出分析结果；
-   `lib/HTMLPlugin.js`：html-webpack-plugin 的插件，给 html 页面增加打包后的 bundle 和在 head 中增加`preload`和`prefetch`的`meta`；（主要增加对 smarty 的支持）；
-   `lib/ModernModePlugin.js`：modern mode 打包插件；
-   `lib/SanFriendlyErrorsPlugin.js`：扩展 friendly-errors-webpack-plugin 的错误类型，统一终端 log。

另外`utils.js`里面有一些工具函数可能在二次开发中会用得到。

## 核心概念介绍

为了方便理解下面的内容，在介绍 San CLI 的工作流程之前，先介绍下 San CLI 的核心概念：

1. 流程：CLI 的流程分为两段，主流程和 Service 流程；
    1. 主流程：`index.js`的流程，是整个 CLI 的工作流程，如果有自定义的 command，则会执行对应的 handler；如果主流程没有相关命令，则会走到`default`，`default`会实例化 Service，进入 Service 流程；
    2. Service 流程：CLI 的 Service 层设计，主要进行 Webpack 构建相关的处理逻辑；可以通过 Service 插件的`api.registerCommand`方法注册 Service 流程的命令；
    3. P.S：`build`、`serve`、`inspect`都是走的 Service 流程。
2. Command：指的是通过[yargs](https://github.com/yargs/yargs/)创建的命令行 bin 工具，它可以通过`.sanrc`的`commands`字段对命令进行扩展；
3. Command 插件：指通过给 Command 添加自定义命令的方式，添加 Command 插件，这样的插件可以使用`san your_command_name [options]`方式在主流程触发；
4. Service：CLI 的 Service 层设计，主要进行 Webpack 构建相关的处理逻辑；
5. Service 插件：Service 层的插件。

主流程通过 command handler 触发 Service 流程，如果存在对应的 command（通过`.sanrc`扩展） 则会直接在主流程中执行对应的 handle。

## 主流程：命令行实现

San CLI 的命令行使用了[yargs](https://github.com/yargs/yargs/)。在`lib/commander.js`中，创建一个 yargs 实例，通过中间件机制添加了常用的方法和属性到`argv`对象中，方便下游 handler 直接使用。

整个 CLI 的工作流程在`index.js`中，大致流程如下：

1. 检查 node 版本；
2. 添加最新版本检查器；
3. 调用`lib/command.js`创建 Command 实例 cli：
    1. 添加全局 option
    2. 添加中间件：
        1. 设置全局 `logLevel`
        2. 设置`NODE_ENV`环境变量
        3. 给 `argv`添加日志等属性方法
4. 加载内部命令：`init`、`build`、`serve`、`inspect`和`default`：
    1. `default`中定义没被直接定义的命令会走 Service 层的 Command 实现
    2. `default`中会实例化 Service，然后执行`Service.run(commandName, argv)`
5. 加载`.sanrc`文件
    1. 添加`.sanrc`中的 command，实现 CLI 的命令行插件
    2. 将`.sanrc`中跟 Service 相关配置通过 Command 中间件添加到 `argv`对象
6. 触发`process.argv`解析执行，开始 CLI 的正式执行。

## san-cli-command-init：脚手架实现

项目脚手架初始化是在`san-cli-command-init`中实现的，原理是通过 git 命令拉取对应 github/icode/gitlab 等脚手架模板的 repo 到本地，然后使用[vinyl-fs](https://github.com/gulpjs/vinyl-fs)将依次将文件进行处理后生成项目代码。

`san-cli-command-init`的核心是一个`TaskList`类，通过四步串行任务完成：

1. 检查目录和离线包状态：检查模板的本地路径和离线包是否可用；
2. 下载项目脚手架模板：从 github 等线上下载模板到 user-home 的模板缓存路径；
3. 生成项目目录结构：使用`vinyl-fs`把模板从缓存目录遍历处理到对应的项目目录；
4. 安装项目依赖：询问是否安装`package.json`的依赖。

## 插件机制

San CLI 支持 Command 插件和 Service 插件。

### Command 插件

San CLI 的命令行插件值得是通过配置`.sanrc`的`commands`字段，给 CLI 添加自定义 Command，这里添加的 Command 可以通过`san your_command_name [options]`方式使用。

Command 的插件需要遵循 yargs command module 规范，即按照下面的写法：

```js
exports.command = 'your_command_name [your_option]';
exports.describe = 'command description';
// or exports.desc
exports.aliases = ['alias_cmd'];
exports.builder = {
    option1: {
        default: true,
        type: 'boolean'
    }
};
// builder 还支持函数写法，具体参见：
// 1. https://github.com/yargs/yargs/blob/master/docs/api.md#positionalkey-opt
// 2. https://github.com/yargs/yargs/blob/master/docs/api.md#commandmodule
exports.handler = argv => {
    console.log(`setting ${argv.key} to ${argv.value}`);
};
```

### Service 插件

San CLI 在实现可扩展 Webpack 配置的设计上，借鉴了 Vue CLI 的 Service 机制。现在已`san serve`命令执行流程为例，讲解下整个工作流程：

1. 首先 CLI 通过主流程的 Command 解析 bin 命令，进入`commands/serve`的 handler；
2. handler 主要是实例化 Service，实例化会将配置项和插件进行处理
3. 然后执行`service.run('serve', argv)`，进入 service 流程，这部分代码主要在`service.run`中：
    1. `loadEnv`：加载 env 文件；
    2. `loadProjectOptions`：加载`san.config.js`；
    3. `init`：service 启动：
        1. 初始化插件，并且依次执行；
        2. 依次执行 webpackChain 回调栈；
        3. 依次执行 webpackConfig 回调栈；
4. 触发 CLI 的 handler。

> **webpackChain 回调栈**存储的是接收[webpack-chain](https://github.com/neutrinojs/webpack-chain)格式的 webpack 配置文件的处理函数；
> **webpackConfig 回调栈**存储的是接受普通 webpack 配置文件对象的处理函数。
> P.S：handler 中可以通过 service 插件的 API 获取最终的 webpack config，然后结合`san-cli-webpack`的`build`/`serve`执行对应的打包操作。

插件的定义方法如下：

```js
module.exports = {
    id: 'plugin-id',
    apply(api, projectOptions) {
        api.chainWebpack(webpackConfig => {
            console.log(projectOptions);
            webpackConfig.entry(/*...*/);
        });
    },
    ui() {}
};
```

如果是定义一个 Service 级别的 Command，那么可以采用下面的写法：

```js
module.exports = {
    id: 'san-cli-command-serve',
    apply(api, projectOptions) {
        // 注册命令
        api.registerCommand(command, {
            builder,
            description,
            handler(argv){
                const webpackConfig = api.getWebpackConfig();
                //...
                开始 webpack 的操作
            }
        });
    }
};
```

#### Service 插件 API

属性：

-   `.id`：插件 id；
-   `.service`：service 实例；
-   `.log/logger`：日志对象，包含 debug/done/error/warn/log/fatal/trace/time/timeEnd/textColor/bgColor 等；
-   `.version`：San CLI 版本号。

常见方法包括：

-   `.isProd()`：是不是生产环境打包，`process.NODD_ENV==='production'`；
-   `.registerCommand(name, handler)`：注册 command 命令，实例化 Service 之后执行`service.run(command, argv)`触发；
-   `.configWebpack(fn)`：将`fn` 压入 webpackConfig 回调栈，`fn`会在出栈执行时接收 webpackConfig，用于修改 webpack config；
-   `.chainWebpack(fn)`：将`fn` 压入 webpackChain 回调栈，`fn`会在出栈执行时接收 chainableConfig，用于 webpack-chain 语法修改 webpack config；
-   `.resolve(p)`：获取 CLI 执行目录的完整路径；
-   `.getWebpackChainConfig()`：获取 webpack-chain 格式的 config；
-   `.getWebpackConfig([chainableConfig])`：将传入的 webpack-chain 格式 config 处理成 webpackConfig 返回；
-   `.getCwd()`：获取 CLI 的执行目录；
-   `.getProjectOptions()`：获取项目的配置内容；
-   `.getVersion()`：获取 CLI 版本；
-   `.getPkg()`：获取当前项目`package.json`内容；
-   `.addPlugin(plugin, options)`：添加插件；
-   `.addDevServerMiddleware()`：添加 dev-server 中间件，**这里注意：中间件需要使用 factory 函数返回**

**`.addDevServerMiddleware()`示例：**

```js
api.addDevServerMiddleware(() =>
    // return 一个 Expressjs 中间件
    require('@baidu/hulk-mock-server')({
        contentBase: path.join(__dirname, './' + outputDir + '/'),
        rootDir: path.join(__dirname, './mock'),
        processors: [
            `smarty?router=/template/*&baseDir=${path.join(__dirname, `./${outputDir}/template`)}&dataDir=${path.join(
                __dirname,
                './mock/_data_'
            )}`
        ] // eslint-disable-line
    })
);
```

> P.S：Service 是继承`EventEmitter`的，具有事件机制，不过目前还没有使用，sad~。
