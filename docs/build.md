# 生产打包

## 使用命令

```bash
san build [entry]
```
entry 入口文件，默认从 san Config 中获取 pages 的 entry

## 参数说明

`--profile` 是否展示编译进度日志，值为 true 或 false，默认是 false

`--watch，--w` 是否监听代码变化

`--mode，--m` 环境指示，值为 development 或 production，默认是 production

`--config，--config-file` 指定san config内容，值为 san config 文件的地址，默认会从目录中找寻 san.config.js 或 .san.config.js 文件

`--analyze，--analyzer` 是否使用 webpack-analyze-bunlde 输出包分析，值为 true 或 false，默认 false

`--no-clean` 是否在 building 之前不删除上一次的产出文件，值为 true 或 false，默认 false

`--no-colors` 是否展示无色彩 log，值为 true 或 false，默认是 false

`--stats` 美化格式化输出

`--modern` 是否使用 modern mode 打包，值为 true 或 false，默认是 false，modern mode[参考](./modern-mode.md)

`--report-json，--reportJson` 是否输将包分析报表生成为report.json，值为 true 或 false，默认是 false

`--report` 是否输将包分析报表生成为单个HTML文件，值为 true 或 false，默认 false，仅生成 Webpack Stats JSON 文件

`--remote` 将编译产出远程部署到目标机器地址，具体使用可[参考](./env.md)

`--dest` 产出文件目录
