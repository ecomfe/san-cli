
# 开发打包

`san serve`是开发环境打包，下面详细说下用法。

## 使用命令

```bash
san serve [entry]
```

-   entry：入口文件，用于编译单一文件，不传入，则从当前[工作目录](https://zh.wikipedia.org/wiki/%E5%B7%A5%E4%BD%9C%E7%9B%AE%E9%8C%84)，读取 Config 文件的 pages 配置项

## 参数说明

### 配置相关

-   `--mode，--m`：环境指示，值为 development 或 production，默认是 development
-   `--config，--config-file`：指定 san config 内容，值为 san config 文件的地址，默认会从当前目录寻找 san.config.js 文件
-   `--port，--p`：指定 devServer 端口号，默认为 8899
-   `--host，--H`：指定 devServer 域名，默认为 0.0.0.0
-   `--https`：启用 https，值为 true 或 false，默认是 false
-   `--public`：指定 HMR client 的 URL，默认为 http://localhost:8899/sockjs-node

### 报告和日志相关

-   `--profile，--profiler`：是否展示编译进度日志，值为 true 或 false，默认是 false

### 其他

-   `--no-progress`：禁用默认的进度条（webpackbar）值为 true 或 false，默认是 false
-   `--open，--O`：是否在编译打包完成后，自动在浏览器中打开页面地址，值为 true 或 false，默认是 false
-   `--qrcode`：是否输出页面地址二维码，值为 true 或 false，默认是 true
-   `--esm`：是否开启 esmodule 打包以加速本地调试的启动速度，开启后会使用 esbuild-loader 替换 babel-loader，默认是 false

### 基于ESM的本地构建

执行`san serve --esm`即可开启基于ESM的本地构建加速，我们从以下几个方面来了解：

1. 本地调试的场景

项目在进行本地调试时，最主要的目的是功能的快速查看和验证，尤其在大型的项目中，本地构建的速度会对开发效率产生较大影响。实际情况中，开发者的本地浏览器多数版本较新，能够很好的支持 js 的 esnext 版本，那么，通过 babel 的 pollyfill 实现的 ES5 代码的转换完全可以省略；另一方面面向 esnext 构建，也可进一步尝试更快的转换工具 `esbuild-loader`，提升js的解析速度，`san serve --esm` 命令即从以上两方面出发，通过 esbuild-loader 指定构建 esnext 版本 bundle，提升本地构建效率。
2. 加速的原理以及实际的效果

[esbuild](https://github.com/evanw/esbuild) 是基于go语言实现的 JavaScript 打包工具，其打包速度相较于 webpack 有近百倍的提升，两者的实现原理并不相同，因此我们仅利用 esbuild 加速 js 的转换。开启 `esm` 项后，会将 `babel-loader` 替换为 [`esbuild-loader`](https://www.npmjs.com/package/esbuild-loader)，默认构建 target 指定为 **es2015**。
通过对 San CLI 的默认 demo 进行测试，开启 esm 构建后，本地调试速度提升 30%+（1440ms -> 969ms）。
3. 为什么不在生产环境使用？

-  js 转换：在实际的项目中，通常需要对不支持 ES6 浏览器进行兼容，但 esbuild 仅支持构建 ES6 及以上版本，因此在生产环境中，仍使用 babel 进行转换。
-  js 压缩：`esbuild-loader` 提供了生产环境对 js 进行压缩的插件 `ESBuildMinifyPlugin`，经 demo 测试，对比默认的 `terser-webpack-plugin`，其压缩速度提升30%，压缩后 bundle 体积略有增加。

综上，在 San CLI 的开发环境中，通过指定 esm 即可快速开启 esbuild 加速本地构建，而在生产环境中，仅支持  esbuild 提供的压缩能力，默认不开启，可通过 `loaderOptions.esbuild` 的配置选择开启，[配置详见](https://ecomfe.github.io/san-cli/advanced/#loaderoptions.esbuild)

