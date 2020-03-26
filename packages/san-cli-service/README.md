# San-cli-service

San CLI 中 webpack 编译核心内容，以及扩展 service 插件功能。

## 安装

```shell
$ npm install --save-dev @baidu/san-cli-service
```

## 使用
```js
const Service = require('@baidu/san-cli-service');

// 参数一 插件名称，String类型；
// 参数二 插件配置项，Object类型：
    // cwd：工作目录，String 类型
    // configFile：配置文件，String | Object 类型
    // watch：是否使用 watch 模式，Boolean 类型，默认为 false
    // mode：当前模式，String 类型，默认取 process.env.NODE_ENV
    // plugins：插件集合，Array 类型
    // useBuiltInPlugin：是否使用基础编译打包插件(configs/app，configs/base，configs/css，configs/optimization)，Boolean 类型，默认为 true
    // projectOptions：san.config.js 配置项信息
    // useProgress：是否使用进度条插件 san-cli-plugin-progess，Boolean 类型，默认为 true
    // useProfiler：是否使用 webpackbar 的 profiler，进度条插件的参数，Boolean 类型，默认为 true

const service = new Service('docit', {
    cwd,
    configFile,
    watch,
    mode,
    useBuiltInPlugin,
    projectOptions,
    plugins: flatten(plugins),
    useProgress: !noProgress,
    useProfiler: profile
});

// 传入 service 编译完成后要执行的回调函数
service.run(callback);
```

## 测试

执行命令

```bash
#执行__tests__下所有测试文件
yarn test san-cli-service
#只执行某单个文件 例如：Service.spec.js
yarn test san-cli-service Service
```
