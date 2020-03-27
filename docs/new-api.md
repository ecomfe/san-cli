# 插件机制

我们可以自己扩展 CLI，让其支持更多的命令和功能。下面介绍下对于的接口。

## CLI 插件格式

CLI 的插件是一个 Node.js 模块，插件格式如下：

```js
exports.command = '';
exports.description = '';
exports.builder = {}; //(yargs)=>{}
// 这里handler的参数是argv，cliApi，跟service plugin的apply(api, projectOptions) 反着？还是统一合适？
// cli关注多的是argv，可能不需要api就能实现功能，根据重要程度来讲，所以放到前面？
exports.handler = (parsedArgv, cliApi) => {
    // logger对象，支持log、fatal、error、success、info、warn、debug、trace等
    cliApi.logger;
    // 展现help信息
    cliApi.help();
    // cli对象
    const cli = cliApi.getCliInstance();
    // 执行 service，会自动加载sanrc和package.json的servie配置
    cliApi.runSerivce(); // 等同于下面两步
    const service = cliApi.getServiceInstance();
    service.run();
    // service继承自 EventEmitter，主流程中进行事件派发
    service.on();
    // Service 类，方便自动new Service不满足需求
    cliApi.Service;
};
```

## Service Plugin 格式

```js
module.exports = {
    id: 'smarty-middleware',
    apply(api, projectOptions) {
        // logger对象，支持log、fatal、error、success、info、warn、debug、trace等
        api.logger;
        api.isProd(); // 是不是生产环境打包
        api.getCwd(); // 获取 CLI 的执行目录
        // 获取 CLI 执行目录的完整路径；
        api.resolve(path);
        // 将`fn` 压入 webpackConfig 回调栈，`fn`会在出栈执行时接收 webpackConfig，用于修改 webpack config；
        api.configWebpack(fn);
        // 将`fn` 压入 webpackChain 回调栈，`fn`会在出栈执行时接收 chainableConfig，用于 webpack-chain 语法修改 webpack config；
        api.chainWebpack(fn);
        api.getWebpackChainConfig(); // 获取 webpack-chain 格式的 config；
        api.getWebpackConfig(); // 将传入的 webpack-chain 格式 config 处理成 webpackConfig 返回；
        // 添加 dev-server 中间件，**这里注意：中间件需要使用 factory 函数返回**
        api.middleware(() => {});
        api.getVersion(); // 获取 CLI 版本；
        api.getPkg(); // 获取当前项目`package.json`内容；
        api.addPlugin(plugin, options); // 添加插件；
    }
};
```
