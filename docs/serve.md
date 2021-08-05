
# 开发打包

`san serve`是开发环境打包，下面详细说下用法。

## 安装

```bash
$ npm install --save-dev san-cli-serve
```

## 使用命令

```bash
san serve [entry]
```

-   entry：入口文件，用于编译单一文件，不传入，则从当前[工作目录](https://zh.wikipedia.org/wiki/%E5%B7%A5%E4%BD%9C%E7%9B%AE%E9%8C%84)，读取 Config 文件的 pages 配置项

## 参数说明

### 跟配置相关

-   `--mode，--m`：环境指示，值为 development 或 production，默认是 development
-   `--config，--config-file`：指定 san config 内容，值为 san config 文件的地址，默认会从目录中找寻 san.config.js 文件
-   `--port，--p`：指定 devServer 端口号，默认为 8899
-   `--host，--H`：指定 devServer 域名，默认为 0.0.0.0
-   `--https`：启用htts，值为 true 或 false，默认是 false
-   `--public`：指定 HMR client 的 URL，默认为 http://localhost:8899/sockjs-node
### 报告和日志相关

-   `--profile，--profiler`：是否展示编译进度日志，值为 true 或 false，默认是 false
### 其他

-   `--no-progress`：禁用默认的进度条（webpackbar）值为 true 或 false，默认是 false
-   `--open，--O`：是否在编译打包完成后，自动在浏览器中打开页面地址，值为 true 或 false，默认是 false
-   `--qrcode`：是否输出页面地址二维码，值为 true 或 false，默认是 true
-   `--esm`：是否开启esmodule打包加速本地调试启动速度，开启后使用esbuild-loader替换babel-loader
