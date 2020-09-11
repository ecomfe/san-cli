# san-cli-utils

San CLI 中所用到的工具类函数：

-   asgert.js：检验入参类型
-   color.js：terminal 输出内容颜色美化工具
-   Consola.js：耗时打点工具
-   ConsolaReporter.js：格式化输出报告工具
-   env.js：环境相关的函数，判断当前环境是否安装 yarn；获取当前环境的 git user 信息
-   ipc.js: ipc通讯相关函数
-   path.js：路径相关的函数
-   randomColor.js：随机生成颜色
-   readPkg.js：读取 package.json 中的数据，输出 Object 返回
-   readRc.js：读取 .rc 或者 .sanrc 文件，输出 Object 返回
-   SError.js：Error 继承类
-   ttyLogger.js：输出相关的 log
-   utils.js：其他工具类函数

## 安装

```shell
$ npm install --save-dev san-cli-utils
```

## 测试

执行命令

```bash
#执行__tests__下所有测试文件
yarn test san-cli-utils
#只执行某单个文件 例如：env.spec.js
yarn test san-cli-utils env
```
