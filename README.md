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

## 文档

请移步[San-CLI 文档](./docs/README.md)
