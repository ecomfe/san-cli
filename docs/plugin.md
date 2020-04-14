

# 插件

San CLI 是灵活可扩展的，我们可以通过编写插件来扩展 San CLI 的功能。San CLI 的插件分为两类：

-   Command 插件：命令行插件，指通过给 Command 添加自定义命令的方式，添加 Command 插件，这样的插件可以使用`san your_command_name [options]`方式在主流程触发；
-   Service 插件：Service 层的插件，用于对 Webpack 构建流程进行扩展。

:::warning 特殊说明
Command 插件在执行时机上要比 Service 插件更加提前，并且在读取 `san.config.js` 之前；而 Service 插件主要是针对 Webpack 相关的，会加载内置 Webpack 配置和`san.config.js`配置。
:::

### 深入阅读

-   [Command 插件](/cmd-plugin.md)
-   [Service 插件](/srv-plugin.md)
