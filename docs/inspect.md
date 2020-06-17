---
title: 查看webpack内置信息
---

# 查看 webpack rule

## 查看所有内置 webpack rules list

```bash
san inspect --rules
```

```js
[
  'san',
  'js',
  'ejs',
  'html',
  'svg',
  'img',
  'media',
  'fonts',
  'css',
  'postcss',
  'less'
]
```

## 查看具体内置 webpack rule 信息

```bash
san inspect --rule postcss
```

# 查看 webpack plugin

## 查看所有内置 webpack plugins list

```bash
san inspect --plugins
```

```js
[
  'san',
  'case-sensitive-paths',
  'define',
  'hmr',
  'no-emit-on-errors',
  'html-index',
  'san-html-index',
  'html-demo-store',
  'san-html-demo-store',
  'html-webpack-harddisk-plugin',
  'copy-webpack-plugin',
  'progress'
]
```

## 查看具体内置 webpack plugin 信息

```bash
san inspect --plugin copy-webpack-plugin
```

```js
new CopyPlugin(
  {
    patterns: [
      {
        transform: function () { /* omitted long function */ },
        from: '/Users/baidu/Desktop/baidu/xxx/template',
        to: '/Users/baidu/Desktop/baidu/xxx/output/template',
        globOptions: {
          ignore: [
            'index.html',
            '.DS_Store',
            'index/index.tpl',
            'demo-store/index.tpl'
          ]
        }
      }
    ]
  }
)
```

