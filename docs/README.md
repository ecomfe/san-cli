# hulk CLI

> 为 San 项目提供开发脚手架和组件化开发解决方案

hulk-cli 新版本暂时未发布正式版，需要使用`@baidu/hulk-cli@next`方式安装，新版本的 hulk-cli 内置了 webpack，针对手百现有 webpack 使用情况整理成最佳实践。提供项目创建（init）、项目开发启动（serve）和项目打包上线（build）三个主要命令，还有组件化开发（component）、代码 lint 等其他辅助工具集。

## 预备知识

-   [san](https://baidu.github.io/san/)
-   webpack
-   [san store](https://github.com/baidu/san-store)

## 安装 CLI 工具

参见[hulk-cli](./hulk-cli.md)

## 项目创建

-   [项目脚手架](./project.md)
-   [如何创建一个脚手架](./create-scaffold.md)

## 组件开发

参见[组件开发](./component.md)

## 最佳实践&解决方案

-   [函数库](./xbox.md)
-   [端能力函数库](./native.md)
-   [mock server：apim 和本地 mock server 两种](./mock.md)
-   [移动端多屏适配方案：vw & rem 切图](./rem.md)
-   [service 层：fly.io 来做业务请求库，统一 service](./service.md)
-   [mock native](./mock-native.md)
-   [一些小规范](./practice.md)
