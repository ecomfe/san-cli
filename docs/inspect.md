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

