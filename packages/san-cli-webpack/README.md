# san-cli-webpack

San CLI 中所用到的 webpack 相关的自定义插件以及 生产、开发模式下的编译部分。

```
├── lib           # 自定义 webpack 插件 以及 格式化输出函数
├── serve.js      # 开发模式编译
└── build.js      # 生产模式编译
```

## 安装

```shell
$ npm install --save-dev san-cli-webpack
```

## 测试

执行命令

```bash
#执行__tests__下所有测试文件
yarn test san-cli-webpack
#只执行某单个文件 例如：utils.spec.js
yarn test san-cli-webpack utils
```

## 完整文档

请移步[San-CLI 文档](https://ecomfe.github.io/san-cli)
