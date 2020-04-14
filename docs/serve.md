
# 开发打包

`san serve`是开发环境打包，下面详细说下用法。

## 使用命令

```bash
san serve [entry]
```

-   entry：入口文件，用于编译单一文件，不传入，则从当前[工作目录](https://zh.wikipedia.org/wiki/%E5%B7%A5%E4%BD%9C%E7%9B%AE%E9%8C%84)，读取 Config 文件的 pages 配置项

## 参数说明

-   `--port，--p`：指定 devServer 端口号，默认为 8899
-   `--use-https`： 请求头是否使用 https，默认为 false
-   `--host，--H`：指定 devServer 域名，默认为 0.0.0.0
-   `--public`：指定 HMR client 的 URL，默认http://localhost:8899/sockjs-node
-   `--open，--O`：是否在编译打包完成后，自动在浏览器中打开页面地址，值为 true 或 false，默认是 false
-   `--qrcode`：是否输出页面地址二维码，值为 true 或 false，默认是 true
-   `--mode，--m`：环境指示，值为 development 或 production，默认是 development
-   `--config，--config-file`：指定 san config 内容，值为 san config 文件的地址，默认会从目录中找寻 san.config.js 文件
