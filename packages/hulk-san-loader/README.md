## fork from [san-webpack-loader](https://jiangjiu.github.io/san-webpack-loader)，主要修改：增加 mdurl 支持，去掉 rootcontext 支持


<div align="center">
    <img src="https://b.bdstatic.com/searchbox/icms/searchbox/img/san-icon.png"></img>
    <h1> san-webpack-loader</h1>
    <p>🌈 a webpack-v4 loader for San.js ☄️</p>
</div>


[文档请点这里](https://jiangjiu.github.io/san-webpack-loader/#/README)

![](https://img.shields.io/github/release/jiangjiu/san-webpack-loader.svg)
![](http://progressed.io/bar/80?title=done)
![](https://img.shields.io/npm/dt/san-webpack-loader.svg)

![san-webpack-loader](http://ov35lvdq9.bkt.clouddn.com/san-webpack-hot.gif)

## Install

```js
  npm install san-webpack-loader
  or
  yarn add san-webpack-loader
```
## Usage

```js
@file: webpack.config.js

// make sure the process.env.NODE_ENV is 'production' or 'development'
{
  test: /\.san$/,
  include: /src/,
  use: [
    {loader: 'babel-loader?cacheDirectory=true'},
    {
        loader: 'san-webpack-loader', options: {
            stylus: stylusOptions,
            hotReload: !isProduction,
            sourceMap: isProduction,
            minimize: isProduction
        }
    }
  ]
}
```


## TODO
1. ~~webpack4 Boilerplate 多线程优化~~
2. css in js 方案

## CHANGELOG

### 1.2.6
[新特性]
- 模板支持导出san-store的方式如： export default connect.san

### 1.2.5
[修复]
- 模板attrs大小写敏感，不会按照html标准进行转换，保留原样。1.2.3引入
### 1.2.4
[修复]
- stylus options未设置，导致的报错
### 1.2.3
[新特性]
- 增加sass支持

[内部变更]
- isProduction改为config

### 1.2.2
[新特性]
- san-webpack-loader的options对象支持stylus属性，可以对.san文件中的stylus部分进行配置

### 1.2.1
[新特性]
- 增加less支持

### 1.2.0
[update]
- 内部实现由同步loader改成异步，更好的利用多线程

### 1.1.3
[BUG修复]
- 修复了windows环境下样式路径失效的问题，对os做了区分处理
- 移除cache-loader，防止内联loader处理的样式文件被缓存后，无法被MiniCssExtractPlugin输出的问题

### 1.1.2
[BUG修复]
- 随官方升级babelrc的设置，推荐在业务中使用babel.config.js

### 1.1.1
[新特性]
- 升级babel依赖
- 增加cache-loader options做文件缓存  需要安装cache-loader
- 生产环境默认关闭sourcemap

## License
  MIT
