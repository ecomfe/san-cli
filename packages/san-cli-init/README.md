# san-cli-init

san-cli-init 是 [San](https://github.com/baidu/san) CLI 工具中创建项目的核心功能部分。
是一个 [command 插件](https://ecomfe.github.io/san-cli/#/cmd-plugin)。

主要步骤如下：

-   tasks/checkStatus.js 检查目录状态
-   tasks/download.js 下载模板
-   tasks/generator.js 渲染模板
-   tasks/installDep.js 安装依赖

## 使用文档

请移步[San-CLI 文档](https://ecomfe.github.io/san-cli)

## 安装

```shell
$ npm install --save-dev san-cli-init
```

## 测试

执行命令

```bash
#执行 __tests__ 文件夹下所有测试文件
yarn test san-cli-init
#只执行某单个文件 例如：checkStatus.spec.js
yarn test san-cli checkStatus
```
