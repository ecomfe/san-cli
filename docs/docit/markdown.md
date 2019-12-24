---
title: Markdown 语法扩展
markdownIt:
    lineNumbers: false
---

# Markdown 语法扩展

## FrontMatter

san docit 中的 Markdown 支持使用 [YAML front matter](https://jekyllrb.com/docs/frontmatter/)：

```yaml
---
title: 文档的title
favicon: favicon.ico
meta:
    - description: 这是文档描述
---

```

:::warn 特殊说明

1. 单文档内的 frontmatter 会在启动 dev-server 之前解析出来，并且作为`html-webpack-plugin`的`options`（合并全局配置`.docit.yml`）；
2. frontmatter 修改之后，需要重新启动 dev-server 才能看到效果。

:::

### FronttMatter 支持多种格式

我们还支持 JSON 和 TOML 的 front matter：

JSON 格式的 front matter 需要用花括号包裹：

```json
---
{
  "title": "文档的title"
}
---
```

而 TOML 格式的则需要显示的注明：

```toml
---toml
title = "文档的title"
---
```

### 应用举例

**1. 给当前页面添加 title 和 description：**

```yaml
---
title: 文档的title
meta:
    - description: 这是文档描述
---

```

**2. 当前页面配置 markdown-it ：**

```yaml
---
title: Markdown 语法扩展
markdownIt:
    lineNumbers: false
---

```

## 表格优化

在我们的 markdown-it 中，我们使用了[markdown-it-multimd-table](https://www.npmjs.com/package/markdown-it-multimd-table)插件，所以我们支持 [GFM](https://github.github.com/gfm/)格式的表格：

| Option |                                                               Description |
| -----: | ------------------------------------------------------------------------: |
|   data | path to data files to supply the data that will be passed into templates. |
| engine |    engine to be used for processing templates. Handlebars is the default. |
|    ext |                                      extension to be used for dest files. |

| Option | Description                                                               |
| ------ | ------------------------------------------------------------------------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default.    |
| ext    | extension to be used for dest files.                                      |

在表格中，还可以使用 `^^`来跟上一行表格进行合并：

```markdown {lineNumber: false}
Stage | Direct Products | ATP Yields
----: | --------------: | ---------:
Glycolysis | 2 ATP ||
^^ | 2 NADH | 3--5 ATP |
Pyruvaye oxidation | 2 NADH | 5 ATP |
Citric acid cycle | 2 ATP ||
^^ | 6 NADH | 15 ATP |
^^ | 2 FADH2 | 3 ATP |
**30--32** ATP |||
[Net ATP yields per hexose]
```

Stage | Direct Products | ATP Yields
----: | --------------: | ---------:
Glycolysis | 2 ATP ||
^^ | 2 NADH | 3--5 ATP |
Pyruvaye oxidation | 2 NADH | 5 ATP |
Citric acid cycle | 2 ATP ||
^^ | 6 NADH | 15 ATP |
^^ | 2 FADH2 | 3 ATP |
**30--32** ATP |||
[Net ATP yields per hexose]

## Emoji 支持

**输入：**

```
:robot: :tada: :100: :muscle: :santa: :cn: :boom: :fox_face:
```

**输出：**

:robot: :tada: :100: :muscle: :santa: :cn: :boom: :fox_face:

可以在[这里](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json)找到所有支持的 Emoji。

## 提示框

**输入：**

```
::: info
这是一个提示
:::

::: info 标题
这是一个提示
:::

::: warning
这是一个警告
:::

::: danger
这是一个危险警告
:::

::: success
这是一个成功提示
:::
```

**输出：**
::: info
这是一个提示
:::

::: info 标题
这是一个提示
:::

::: warning
这是一个警告
:::

::: danger
这是一个危险警告
:::

::: success
这是一个成功提示
:::
