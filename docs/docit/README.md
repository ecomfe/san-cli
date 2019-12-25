---
title: 使用 San CLI 建文档网站
markdownIt:
    lineNumbers: false
---

# San CLI 中的 docit 命令

San CLI 的前身 Hulk CLI 有一个 San 组件文档编写命令（hulk component），这次 San CLI 将这个功能迁移过来，并且增强了 Markdown 建站功能，San CLI 的文档网站就是该命令生成的。

::: info 提示
san docit 命令是放在`packages/san-cli-command-docit`中实现的，它是一个 Service 层插件，如果要编写自己的 Service 层插件可以参考它的代码。
:::

## 基本用法

`san docit`是 San CLI 内置的命令，它可以实现 Markdown 文档转 HTML 的预览，基本用法如下：

```bash
san docit path/to/markdown.md
# 下面命令会将对应目录下面的所有 md 文件都读取出来
# **_**下划线开头的md 文件不会被读取
san docit markdown/path
```

### 输出

通过`--output`可以将整个内容打包生成 html 文档。

```bash
san docit --output
```

::: info 提示
san docit 还是基于 Webpack 来实现的，所以支持`san.config.js`配置文件配置。
:::

## `.docit.yml`配置文件

`.docit.yml`是 docit 命令自己的配置文件，可以用来配置网站信息和指定主题，配置项如下：

```yaml
title: 网站 title
theme: 主题
```

::: info 提示
1. `.docit.yml`可以在主题中使用`import siteData from '@sitedata';`获取；
2. 单 Markdown 中的 frontmatter 会和`.docit.yml`的同名配置项合并使用。
:::

## 特殊文件

`_sidebar.md`和`_navbar.md`这俩文件是特殊文件，分别作为侧边栏和顶部导航链接使用，这俩文件中必须是一个 Markdown 列表，例如下面：

```markdown
-   [San](https://baidu.github.io/san/)
-   [Santd](https://ecomfe.github.com/santd/)
```

这俩文件的内容可以在主题（[theme](./theme.md)）代码中使用`import sidebar from '@sidebar'`和`import navbar from '@navbar'`来获取。
