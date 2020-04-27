

# 编写一个 Serivce 插件

San CLI 在实现可扩展 Webpack 配置的设计上，借鉴了 Vue CLI 的 Service 机制。Service 主要是对 Webpack 的配置进行统一处理和封装，当 Service 实例化之时，会将依次将 Service 的插件进行注册执行，对 Webpack 的配置进行修改。

一个 Service 插件的定义结构如下：

```js
module.exports = {
    // 插件 id
    id: 'plugin-id',
    // 插件的入口函数
    apply(api, projectOptions, options) {
        api.chainWebpack(webpackConfig => {
            console.log(projectOptions);
            webpackConfig.entry(/*...*/);
        });
    },
    // gui 预留接口
    ui() {}
};
```

## 插件的`apply`函数

插件的`apply`函数接受三个参数：

1. `api`是 PluginAPI 实例，会提供一些 api（下面详细介绍）；
2. `projectOptions`是 san.config.js 处理后的项目配置；
3. `options` 是插件自己的参数，使用插件时：

```js
// san.config.js
module.exports = {
    plugins: [[requie('plugin'), {options}]]
};
// 或者使用 service addPlugin
serviceInstance.addPlugin(require('plugin'), options);
```

> 在插件中，可以直接使用`__isProduction`变量，代表是否为`mode==='production'`，即生产环境打包。

## 在插件内修改 Webpack 配置

在插件内有两种方法可以修改 Webpack 配置：

1. 通过`api.chainWebpack`获取[webpack-chain](https://github.com/neutrinojs/webpack-chain)链式调用的对象，然后进行 Webpack 配置；
2. 通过`api.configWebpack`获取对象形式的 Webpack Config。

例如：

```js
api.chainWebpack(webpackChain => {
    console.log(projectOptions);
    webpackChain.entry(/*...*/);
});

api.configWebpack(webpackConfig => {
    console.log(projectOptions);
    console.log(webpackConfig.entry);
});
```

## 插件的使用

插件可以发布到 npm 上，命名规范建议使用`san-cli-plugin-*`来命名。不发布到 npm 中也可以本地使用。Service 插件的使用有两种配置方法：

1. 在`san.config.js`的 plugins 字段添加对应的路径或者直接`require`进来；
2. 在项目的`package.json`的`san.plugins`中添加路径或者 npm 插件报名

san.config.js 中举例：

```js
// san.config.js 文件

const plugins = [
    // 这个是直接手写的 plugin
    {
        id: 'smarty-middleware',
        apply(api) {
            api.middleware(() =>
                require('hulk-mock-server')({
                    contentBase: path.join(__dirname, './' + outputDir + '/'),
                    rootDir: path.join(__dirname, './mock'),
                    processors: [
                        `smarty?router=/template/*&baseDir=${path.join(
                            __dirname,
                            `./${outputDir}/template`
                        )}&dataDir=${path.join(__dirname, './mock/_data_')}`
                    ] // eslint-disable-line
                })
            );
        }
    },
    // require进来
    require('san-cli-plugin-x'),
    // 这个是相对路径
    './san-plugin'
];
module.exports = {
    //...
    // 添加插件配置
    plugins
};
```

## Service 插件 API

属性：

-   `.id`：插件 id；
-   `.service`：service 实例；
-   `.log/logger`：日志对象，包含：
    -   debug
    -   done
    -   error
    -   warn
    -   log
    -   fatal
    -   trace
    -   time
    -   timeEnd
    -   textColor
    -   bgColor 等；
-   `.version`：San CLI 版本号。

常见方法包括：

-   `.isProd()`：是不是生产环境打包，`process.NODD_ENV==='production'`；
-   `.configWebpack(fn)`：将`fn` 压入 webpackConfig 回调栈，`fn`会在出栈执行时接收 webpackConfig，用于修改 webpack config；
-   `.chainWebpack(fn)`：将`fn` 压入 webpackChain 回调栈，`fn`会在出栈执行时接收 chainableConfig，用于 webpack-chain 语法修改 webpack config；
-   `.resolve(p)`：获取 CLI 执行目录的完整路径；
-   `.getWebpackChainConfig()`：获取 webpack-chain 格式的 config；
-   `.getWebpackConfig([chainableConfig])`：将传入的 webpack-chain 格式 config 处理成 webpackConfig 返回；
-   `.getCwd()`：获取 CLI 的执行目录；
-   `.getProjectOption()`：获取项目的配置内容；
-   `.getPkg()`：获取当前项目`package.json`内容；
-   `.addPlugin(plugin, options)`：添加插件；
-   `.middleware()`：添加 dev-server 中间件，**这里注意：中间件需要使用 factory 函数返回**

**`.middleware()`示例：**

```js
api.middleware(() =>
    // return 一个 Expressjs 中间件
    require('hulk-mock-server')({
        contentBase: path.join(__dirname, './' + outputDir + '/'),
        rootDir: path.join(__dirname, './mock'),
        processors: [
            `smarty?router=/template/*&baseDir=${path.join(__dirname, `./${outputDir}/template`)}&dataDir=${path.join(
                __dirname,
                './mock/_data_'
            )}`
        ] // eslint-disable-line
    })
);
```

> 详细的使用方法可以查看`san-cli-plugin-progress`的代码。
