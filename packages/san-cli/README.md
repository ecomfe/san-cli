# san-cli

san-cli 是 [San](https://github.com/baidu/san) CLI 工具的命令注册部分。

含有以下内置命令：
-   init：[初始化项目](http://hulk.baidu-int.com/sancli/create-project.html)
-   remote：[管理脚手架模板别名](http://hulk.baidu-int.com/sancli/create-project.html)
-   build：[生产打包](http://hulk.baidu-int.com/sancli/build.html)
-   serve：[开发打包](http://hulk.baidu-int.com/sancli/serve.html)
-   inpect：[查看webpack内置信息]()

扩展命令：
-   command：[扩展CLI命令](http://hulk.baidu-int.com/sancli/cmd-plugin.html)
-   plugin：[扩展或修改webpack配置](http://hulk.baidu-int.com/sancli/srv-plugin.html)

## 安装

```shell
$ npm install --save-dev @baidu/san-cli
```

## 测试

执行命令

```bash
#执行__tests__下所有测试文件
yarn test san-cli
#只执行某单个文件 例如：Commander.spec.js
yarn test san-cli Commander
```
