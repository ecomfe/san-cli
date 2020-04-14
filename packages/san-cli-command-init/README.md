# san-cli-command-init

san-cli-command-init 是 [San](https://github.com/baidu/san) CLI 工具中创建项目的核心功能部分。
是一个 [command 插件](https://ecomfe.github.io/san-cli/#/cmd-plugin)。

主要步骤如下：
-   tasks/checkStatus.js 检查目录状态
-   tasks/download.js 下载模板
-   tasks/generator.js 渲染模板
-   tasks/installDep.js 安装依赖

## 安装

```shell
$ npm install --save-dev san-cli-command-init
```

## 测试

执行命令

```bash
#执行__tests__下所有测试文件
yarn test san-cli-command-init
#只执行某单个文件 例如：checkStatus.spec.js
yarn test san-cli checkStatus
```
