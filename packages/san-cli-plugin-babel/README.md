# San-cli-plugin-babel

San CLI 默认的 Babel 插件，主要增加`transpileDependencies`的使用，默认 San CLI 是不会转换`node_modules`文件夹的 js 的，可以通过在`san.config.js`配置`transpileDependencies`：

```js
// san.config.js

module.exports = {
    transpileDependencies: [/@baidu\/nano/, '@super-fe']
};
```

babel-loader 配置在`san-cli-plugin-babel/preset`中，可以直接使用。

## 使用文档

请移步[San-CLI 文档](https://ecomfe.github.io/san-cli)
