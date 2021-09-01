# 查看webpack内置信息

> 注意: 默认不会安装此命令，需要手动安装
## 安装

```shell
$ npm install --save-dev san-cli-inspect
```

## 查看 webpack rule

### 查看所有内置 webpack rules list

```bash
san inspect --rules
```

```js
[
  'san',
  'html',
  'ejs',
  'fonts',
  'media',
  'image',
  'svg',
  'css',
  'less',
  'js'
]
```

### 查看具体内置 webpack rule 信息

```bash
san inspect --rule css
```

## 查看 webpack plugin

### 查看所有内置 webpack plugins list

```bash
san inspect --plugins
```

```js
[
  'san',
  'case-sensitive-paths',
  'define',
  'html-index',
  'san-html-index',
  'html-webpack-harddisk',
  'hmr',
  'no-emit-on-errors',
  'progress'
]
```

### 查看具体内置 webpack plugin 信息

```bash
san inspect --plugin san

/* config.plugin('san') */
new SanLoaderPlugin()
```

```js
/* config.plugin('san') */
new SanLoaderPlugin()
```

### 查看所有内置 service plugins list

```bash
san inspect --service-plugins
```

该命令输出所有生效的 plugin 列表，每项包含该 plugin 的 id 、必须的配置项 optionKeys 、 插件引入的路径 location 、 插件实际的配置值 pluginOptions。在实际使用过程中，可根据列出的路径及配置项来排查问题。例如：

```js
[
  {
    pluginId: 'base',
    optionKeys: [
      'splitChunks',
      'runtimeChunk',
      'cache',
      'sourceMap',
      'publicPath'
    ],
    location: '/local/path/san-cli/packages/san-cli-config-webpack/plugins/base.js',
    pluginOptions: '{"splitChunks":{"cacheGroups":{"vendors":{"name":"vendors1","test":{},"chunks":"initial","priority":-10}}},"runtimeChunk":"single","sourceMap":true,"publicPath":"https://static.com/"}'
  },
  {
    pluginId: 'output',
    optionKeys: [ 'publicPath', 'assetsDir', 'outputDir', 'filenameHashing' ],
    location: '/local/path/san-cli/packages/san-cli-config-webpack/plugins/output.js',
    pluginOptions: '{"publicPath":"https://static.com/","assetsDir":"static/demo-config","outputDir":"output","filenameHashing":true}'
  },
  ...
]
```
