# hulk CLI

> 为 San 项目提供开发脚手架和组件化开发解决方案

hulk-cli 使用`@baidu/hulk-cli`方式安装，新版本的 hulk-cli 内置了 webpack，针对手百现有 webpack 使用情况整理成最佳实践。提供项目创建（init）、项目开发启动（serve）和项目打包上线（build）三个主要命令，还有组件化开发（component）、代码 lint 等其他辅助工具集。

## 预备知识

-   [san](https://baidu.github.io/san/)
-   webpack
-   [san store](https://github.com/baidu/san-store)

## Hulk 1.x 迁移 Hulk 2.x

hulk-cli 目前 2.0 版本已经开始测试，需要使用`@baidu/hulk-cli`方式安装，hulk 1.x 版本迁移 hulk2 [参考文档](./migration.md)。

## 安装 CLI 工具

参见[hulk-cli](./hulk-cli.md)

## 项目创建

-   [项目脚手架](./project.md)
-   [如何创建一个脚手架](./create-scaffold.md)

## Hulk CLI 内置解决方案
Hulk 力求做到零配置打包方案，内置的方案都是通用的解决方案，日常项目不需要关心优化和解决方案可以直接使用。同时针对特殊的项目配置，hulk 项目可以使用`hulk.config.js`进行精细化调整。

1. css 相关：
    1. 内置 postcss、less、cssnano、autoprefixer
    2. 内置了 rem+vw 切图方案
    3. 结合[@baidu/nano](http://hulk.baidu-int.com/docs/nano/#/docs/intro)可以实现 theme 和 svgicon 等解决方案
    4. 可以通过`hulk.config`的 `loaderOptions.postcss`进行精细化调整；
2. js 相关：
    1. 内置了 babel；
    2. polyfill 使用 `core-js@3` 方案；
    3. 内置 babel 插件包括：
        1. `require('@babel/plugin-syntax-dynamic-import')`
        2. `require('@babel/plugin-syntax-import-meta')`
        3. `require('@babel/plugin-proposal-class-properties')`
        4. `require('@babel/plugin-transform-new-target')`
        5. `require('@babel/plugin-transform-modules-commonjs')`
    4. 可以通过`hulk.config`的 `loaderOptions.babel`进行精细化调整；
3. 打包优化和提醒：
   1. splitChunks 已经做了一些通用性的优化，如果要自定义拆包可以配置`hulk.config`的 `splitChunks`
   2. build 命令output 结果添加报表，显示超过体积的 bundle；
   3. **脚手架内置`analyzer`命令（`hulk build --analyzer`），上线前一定要看下代码拆分和使用的代码库是否合理！**
4. 内置了 htmlWebpackPlugin 的一些常见配置：
    1. 可以通过配置`hulk.config`的 `pages`进行精细化调整，比如页面如果想使用 htmlWebpackPlugin 的插件来 inline css/js 等
    2. 内置了 prefetch 和 preload，对于`import()`的模块会加入`link prefetch`标签；
    3. smarty、html 中的 script 和 style 标签内容会自动压缩（minify）
5. 内置了 sentry、martix（矩阵页面）打包
6. 内置了 modern mode 打包
7. 内置 San 组件开发解决方案，详见下面[组件开发](./component.md)
8. 代码规范和质量检测：
    1. hulk 项目脚手架内置了 hulk-lint、lintstage 和 husky
    2. 针对之前出现过的调试代码进入生产环境的case，增加 `alert`、`console.log`和`debugger` error 级别检测，如果真的要用，请添加 eslint 注释

更多内容[继续阅读](./hulk-cli.md)。

## 组件开发

参见[组件开发](./component.md)

## 最佳实践&解决方案

-   [函数库](./xbox.md)
-   [端能力函数库](./native.md)
-   [mock server：推荐公司的 yapi](http://yapi.baidu-int.com)
-   [移动端多屏适配方案：vw & rem 切图](./rem.md)
-   [service 层：fly.io 来做业务请求库，统一 service](./service.md)
-   [mock native](./mock-native.md)
-   [一些小规范](./practice.md)
