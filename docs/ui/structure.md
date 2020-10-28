# CLI UI 插件

CLI插件是一个 npm 包，能够为 San CLI 创建的项目添加额外的功能。
## 插件的命名及npm包基本结构

### 命名

为便于识别，组件应以`san-cli-plugin-<name>`作为的格式命名，这样做不仅便于cli识别，同时便于其他开发者搜索发现

> **note**：创建新插件时需保证名称正确且不重复，使得插件可以正确安装和搜索使用

### 目录结构

如下所示，除满足一个npm包的基本要求外，每个插件需要包含一个ui.js文件，用于导出插件的相关配置信息

```js
.
├── README.md
├── src
│    └── index.js
├── package.json
└── ui.js         // San UI 集成（这里存放插件的配置信息）
```

其中package.json中的以下字段，请尽量全部填写

```js
{
  "name": "san-cli-plugin-tools",
  "version": "0.0.2",
  "description": "san cli ui addon tools",
  ...
}
```

demo可供参考，地址如下：https://github.com/amazing-js/san-cli-plugin-tools

## UI.js文件配置

在每个安装好的 san-cli 插件里，cli-ui 都会尝试从其插件的根目录加载一个可选的 `ui.js` 文件。(也可以使用文件夹形式，例如 `ui/index.js`)。

该文件应该导出一个函数，函数会以 API 对象作为第一个参数：

```javascript
module.exports = api => {
  // 在这里使用 API...
}
```
其中api由cli ui传入，为PluginManager的实例，所有插件的扩展功能均基于此函数实现，例如：`api.registerConfig` 注册配置项、`api.registerWidget`注册widget部件、`api.registerAddon`客户端addon等。下文将重点介绍PluginManager对象及其方法
