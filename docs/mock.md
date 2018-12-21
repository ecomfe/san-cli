# mock server
> 为了方便本地假数据调试，减少联调成本，项目支持[apim](http://apim.baidu.com/docs#%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C) 和 [本地实现 Mock Server](http://icode.baidu.com/repos/baidu/hulk/mock-server/tree/master) 两种 mock 方案，在创建项目的时候有选择，**推荐使用`apim`**

## Local Mock Server
Mock Server 实现涉及到代码和说明
```
├── mock    mock 文件
│   ├── _data_  这里是JSON 数据，跟template 目录结构一致，支持 Mockjs 语法（**.mock.json）
│   └── index.js 配置文件
├── scripts
│   ├── dev.js
```

`dev.js`中会启动`webpackDevServer`和`hotReload`功能，DevServer会将请求转发到 MockServer，MockServer （代码`middlewares/mocker.js`）包含两部分：`nodeServer`和`smartyServer`，node 遵循[`webpack-api-mocker`](https://github.com/jaywcjlove/webpack-api-mocker/)文档，`smartyServer`是 node 执行`php`命令行渲染 smarty 模板，然后将 stdout 作为输出。

#### Local Mock Server 配置
在 `config/index.js`中添加中间件：

```js
import MockerServer from '@baidu/hulk-mock-server';

// dev.middleware 中间件
export default {
    build: {
        //...
    },
    dev: {
        //...
        middlewares: [
            MockerServer({
                contentBase: path.join(__dirname, '../dist/'),
                rootDir: path.join(__dirname, '../mock'),
                processors:[`smarty?router=/template/*&baseDir=${path.join(__dirname, '../dist/template')}&dataDir=${path.join(__dirname, '../mock/_data_')}`]
            })
        ]
    }
};
```

> 参数说明：
> * contentBase： 网站根目录，一般是 dist 文件夹，默认是工作目录
> * rootDir：可选，默认是 contentBase 下面的mock 文件夹，mock 数据所在文件夹，其中的目录结构说明如下：
>       * index.js 是类似[webpack api-mocker](https://github.com/jaywcjlove/webpack-api-mocker/) 的配置文件，可以配置代理和自定义 mock 接口
>       * _data\_ 是mock数据，里面存放 json ，所有 json 会通过 mockjs 处理，直接访问`[ip]:[port]/_data_/*.json`既可以访问，**另外，smarty 的模板数据也会读取对应的 json 文件，例如：`template/demo/index.tpl` 会读取 `rootDir/_data_/demo/index.json`数据给 smarty 模板使用**
> * processors：解析器数组，支持 url-query 方式传入，也支持对象方式，内置 smarty 解析器。对象方式参考下面：


**自定义模板解析器：**

```js
{
    // router filter 路径，遇见`/_art/*` 会转发给 processor 处理
    router: '/_art_/*',
    // processor 函数，返回一个接受 (req, res, next, filename) 四个参数的express中间件函数；
    // filename 是`/_art_/*` path-to-regexp 匹配之后的文件路径，方便直接加上`baseDir`获取文件地址使用。
    // 默认`baseDir`是 contentBase
    processor: (options) => {
        const rootDir = path.resolve(options.baseDir || '');
        return (req, res, next, filename) => {

            try {
                debug(path.join(rootDir, filename));
                const html = art(path.join(rootDir, filename), {
                    name: 'aui'
                });
                res.end(html);
            }
            catch (e) {
                next(e);
            }
        };

    },
    // processor 初始化的参数配置
    options: {
        baseDir: path.join(__dirname, './art/')
    }
}
```


smarty支持的配置有：`baseDir=./template&bin=php&dataDir=mockDir/_mockdata_`

* baseDir：template 路径，会传递给 smarty->setTempalteDir
* bin：php bin 的路径，默认会使用 node 的 which 查找 php
* dataDir：模板数据来源目录，默认是 rootDir 的 `_data_`目录

## APIM 支持
在 config 中选择`dev.middlewares`选择使用 [apim](http://apim.baidu.com/docs#%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C)

```js
dev: {
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    server: {
        // 这里是 devServer 相关配置
        port: 8888
    },
    middlewares:[
        require('apim-tools').express({
            // 设置存储的 mock 相关数据存储的根目录
            root: __dirname + '/public',
            // 项目 schema token 具体到 apim 平台查看
            schemaToken: 'eb0a795c19db15ca720517940e7251d2',
            // 是否启动时候立刻自动同步
            startAutoSync: true
        })
    ]
}
```




