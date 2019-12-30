# 开发打包

## 使用命令

```bash
san serve [entry]
```
entry 入口文件，默认从 san Config 中获取 pages 的 entry

## 参数说明

`--use-https` 请求头是否使用 https，默认为false

`--public` 指定 HMR client 的 URL，默认http://localhost:8899/sockjs-node

`--port，--p` 指定 devServer 端口号，默认为8899

`--host，--H` 指定 devServer 域名，默认为0.0.0.0

`--mode，--m` 环境指示，值为 development 或 production，默认是 development

`--config，--config-file` 指定san config内容，值为 san config 文件的地址，默认会从目录中找寻 san.config.js 或 .san.config.js 文件

`--open，--O` 是否在编译打包完成后，自动在浏览器中打开页面地址，值为 true 或 false，默认是 false

`--qrcode` 是否输出页面地址二维码，值为 true 或 false，默认是 true
