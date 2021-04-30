# San CLI

San CLI 是一个命令行工具，其次它是一个内置 Webpack 的前端工程化构建工具。

San CLI 在兼顾 San 生态的同时，尽量做到通用化配置，在设计之初，我们希望不局限于 San 的应用范畴，做可定制化的前端开发工具集。

## 安装

::: warning
San CLI 的 Node.js 版本要求 `>= 8.16.0`。
:::

通过下面命令安装 San CLI

```bash
npm install -g san-cli
# OR
yarn global add san-cli
```


## 使用

安装之后，你可以通过下面命令查看帮助

```bash
san -h
san build
san serve
```

## 特点

-   支持 Command 和 Service 双插件机制，可以定制化自己/团队的 CLI
-   内置打包、部署、包分析、性能分析等功能和最佳实践
-   支持自定义项目脚手架
-   支持 Markdown 建站
-   支持 San Component 文档预览功能
