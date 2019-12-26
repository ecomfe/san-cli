---
title: 订制 docit 的主题
---

# 自制 Theme

## 主要文件

### Main

### CodeBox.san

## 模板内使用变量

## exportType

## 全局变量

在模板 js 文件中，`$Page`是当前 Markdown 文档转换成的 San Component 对象，可以直接在内容中

-   `$Page.$toc`：当前文档的 TOC（Table Of Contents）对象，默认解析出`H2~3`，可以通过`markdown-loader`的`extractHeaders`数组来配置具体解析出来的 Header；
-   `$Page.$matter`：当前文档头部 FrontMatter 解析出来的对象；
-   `$Page.$link`：当前文档的链接。

## 通用模块
