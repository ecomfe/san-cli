# San-CLI

San CLI 是基于 [San.js](https://github.com/baidu/san) 进行快速开发的 CLI 工具。San CLI 提供功能：

-   项目脚手架
-   基于 Webpack 的零配置构建工具
-   可扩展命令行和 Webpack 打包插件

San CLI 在兼顾 San 生态的同时，尽量做到通用化配置，在设计之初，我们希望不局限于 San 的应用范畴，做可定制化的前端开发工具集。

## 快速开始

> San CLI 的 Node.js 版本要求 >= 8.16.0。

通过下面命令安装 San CLI

```bash
npm install -g san-cli
# OR
yarn global add san-cli
```

> 如果只在项目中使用，可以添加到项目`package.json`的`devDependencies`，然后使用[npm-scripts](https://docs.npmjs.com/misc/scripts)。

安装之后，你可以通过下面命令查看帮助

```bash
san -h
```

## 如何贡献

San-cli 使用 [yarn](https://yarnpkg.com/) workspaces 来做本地开发，首先 clone 项目到你的电脑，然后安装依赖：

```bash
# 安装依赖
yarn
```

详细的设计，请阅读《[内部实现](./docs/architecture.md)》。

## 测试

执行命令

```bash
# 全部测试
yarn test
# or
yarn test [packageName]
# 例如
yarn test san-cli
```

## debug 日志

在 San CLI 中使用了[debug](https://npmjs.org/package/debug) 模块，如果需要 debug 或者查看一些信息可以使用`DEBUG`变量。在 San CLI 中，debug 的 scope 是`san-cli:`，常用的变量包括：

-   `pref`：输出 San CLI 本身的性能打点数据；
-   `babel`：会输出 babel 相关的配置；
-   `service`：输出 service 层的日志；
-   `webpack:closeDevtool`：会关闭 devtool，不在输出`eval`类型代码，直接输出打包后的代码，方便排查代码问题；
-   `webpack:build`：Webpack build 命令相关的配置；
-   `webpack:serve`：Webpack serve 命令相关的配置；
-   `webpack:config`：输出 Webpack 最终的 config 内容。

## 文档

请移步[San-CLI 文档](./docs/README.md)
