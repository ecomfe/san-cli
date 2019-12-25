# Loader 相关

San CLI 的 docit 命令最核心部分是使用[san-cli-markdown-loader](./packages/san-cli-markdown-loader)来实现的。

## Loader 的使用

San-cli-markdown-loader 必须配合它的 plugin 一起使用，即：

```js
const MarkdownPlugin = require('san-cli-markdown-loader/plugin');
module.exports = {
    module: {
        rules: [
            {
                test: /\.md$/,
                use: [
                    {
                        loader: 'san-cli-markdown-loader',
                        options: {
                            // 对应配置
                        }
                    }
                ]
            }
        ]
    },
    plugins: [new MarkdownPlugin()]
};
```

## Loader 的 options

```js
const options = {
    // 工作目录
    context = process.cwd(),
    // 解析的 sanbox 多语言标签用到的配置
    i18n = '',
    // markdownIt 相关配置，下面详细介绍
    markdownIt,
    // 解析当前页面 toc 结构
    extractHeaders = ['H2', 'H3'],
    // 是否启用 hmr
    hotReload = false
}
```

### markdownIt 相关 options

```js
const markdownIt = {
    // 代码高亮是否显示行号
    lineNumbers = true,
    // markdown-it-anchor 相关配置
    anchor = {permalink: true, permalinkBefore: true, permalinkSymbol: '#'},
    // 扩展 markdown-it 示例
    extend = () => {},
    // markdown-it-toc 配置
    toc = {includeLevel: [2, 3]},
    // markdown-it-multimd-table 配置
    // 默认开启 rowspan
    table = {
        multiline: false,
        rowspan: true,
        headerless: false
    },
    // markdown 实例化参数
    // 支持 string：commonmark、default、zero 和对象格式
    preset:{
        xhtmlOut: true,
        html: true,
        highlight: require('./markdown/prismjs')({lineNumbers})
    }
}
```

其中 `extend`函数格式如下：

```js
const extend = markdownItInstance => {
    // 可以添加自己的 plugin
    // 例如：
    markdownItInstance.use(require('markdown-it-plugin'));
};
```
