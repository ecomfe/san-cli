# 浏览器兼容性


## browserslist

用户可以通过项目中的 `package.json`中`browserslist` 字段 (或 `.browserslistrc`文件)来指定了项目的目标浏览器的范围。这个配置会被 `@babel/preset-env` 和 `Autoprefixer` 用来确定需要转译的JavaScript特性和需要添加的CSS浏览器前缀（[了解更多](https://github.com/browserslist/browserslist)）。


## Polyfill

Polyfill是指一段JS代码，它提供了开发者希望浏览器能够原生提供的技术，目标是打平开发环境和用户浏览器之间的API兼容性差异。

在San CLI中通过 @babel/preset-env 和 browserslist 配置来决定项目需要的 polyfill。

默认情况下，我们会把 `useBuiltIns: 'usage'` 传递给`@babel/preset-env`，这样它会根据源代码中出现的语言特性自动检测需要的Polyfill，这确保了最终包里 Polyfill 数量的最小化。


### 个性化配置

1. 使用`exclude`参数来去掉不需要的polyfill；

```
module.export = {
    // ...
    loaderOptions: {
        babel: {
            exclude: ['es.promise']
        }
    },
    // ...
}

```


2. 通过`polyfills`参数强制引入polyfill（主要解决自动添加存在的一些兼容性问题）；

```
module.export = {
    // ...
    loaderOptions: {
        babel: {
            polyfills: [
                'es.promise',
                // #2012 es7.promise replaces native Promise in FF and causes missing finally
                'es.promise.finally',

                // Promise polyfill alone doesn't work in IE
                'es.array.iterator'
            ]
        }
    },
    // ...
}

```

3. 禁用内置Polyfill配置，即不使用san-cli提供的presets，babel-loader会自动找项目目录下的babel配置文件（`.babelrc` > `babel.config.js`）：

```
module.export = {
    // ...
    loaderOptions: {
        babel: false,
    // ...
}

```

