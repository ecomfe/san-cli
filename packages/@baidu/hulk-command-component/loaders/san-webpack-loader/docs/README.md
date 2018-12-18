# 快速开始
🌈 a webpack-v4 loader for San.js ☄


![](https://img.shields.io/github/release/jiangjiu/san-webpack-loader.svg)
![](http://progressed.io/bar/80?title=done)
![](https://img.shields.io/npm/dt/san-webpack-loader.svg)


## Install

```js
  npm install san-webpack-loader
  or
  yarn add san-webpack-loader
```

## Usage

```js
@file: webpack.config.js
{
  test: /\.san$/,
  include: /src/,
  use: [
    {loader: 'babel-loader?cacheDirectory=true'},
    {loader: 'san-webpack-loader'}
  ]
}
```

### Thanks
inspired by [vue-loader](https://github.com/vuejs/vue-loader)

### License
  MIT
