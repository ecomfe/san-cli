---
title: smarty 相关
---

# Smarty 相关

使用 Smarty 的 PHP 模板，可以配置[Hulk Mock Server](http://icode.baidu.com/repos/baidu/hulk/mock-server/tree/master) ，这个是百度内部实现方案。

## Hulk Mock Server

Mock Server 实现涉及到代码和说明

```
├── mock    mock 文件
│   ├── _data_  这里是JSON 数据，跟template 目录结构一致，支持 Mockjs 语法（**.mock.json）
│   └── index.js 配置文件
├── scripts
│   ├── dev.js
```

`dev.js`中会启动`webpackDevServer`和`hotReload`功能，DevServer 会将请求转发到 MockServer，MockServer （代码`middlewares/mocker.js`）包含两部分：`nodeServer`和`smartyServer`，node 遵循[`webpack-api-mocker`](https://github.com/jaywcjlove/webpack-api-mocker/)文档，`smartyServer`是 node 执行`php`命令行渲染 smarty 模板，然后将 stdout 作为输出。

smarty 支持的配置有：`baseDir=./template&bin=php&dataDir=mockDir/_mockdata_`

-   baseDir：template 路径，会传递给 smarty->setTempalteDir
-   bin：php bin 的路径，默认会使用 node 的 which 查找 php
-   dataDir：模板数据来源目录，默认是 rootDir 的 `_data_`目录

使用 Smarty 模板，则通过`template`文件夹下面的 tpl 进行渲染，全部继承`base.tpl`模板，本地开发通过`localhost:port/template`访问

## 配置举例

```js
const plugins = [
    {
        id: 'middleware1',
        apply(api) {
            // 使用 api 配置dev server 中间件
            api.addDevServerMiddleware(() =>
                require('@baidu/hulk-mock-server')({
                    // 配置contentBase
                    contentBase: path.join(__dirname, './' + outputDir + '/'),
                    // 配置 mock 路径
                    rootDir: path.join(__dirname, './mock'),
                    // 配置解析器相关内容
                    processors: [
                        `smarty?router=/template/*&baseDir=${path.join(
                            __dirname,
                            `./${outputDir}/template`
                        )}&dataDir=${path.join(__dirname, './mock/_data_')}`
                    ] // eslint-disable-line
                })
            );
        }
    }
];
module.exports = {
    plugins
};
```

