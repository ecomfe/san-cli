

# 插件

San CLI 是灵活可扩展的，我们可以通过编写插件来扩展 San CLI 的功能：

-   Service 插件：Service 层的插件，用于对 Webpack 构建流程进行扩展。

::: warning
Service 插件主要是针对 Webpack 相关的，会加载内置 Webpack 配置和`san.config.js`配置。
:::


### 深入阅读

-   [编写一个 Service 插件](/srv-plugin.md)
