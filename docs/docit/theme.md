---
title: 订制 docit 的主题
---

# 自制 Theme

Docit 是支持自定义主题的，如果需要自定义主题，可以参考本文内容，以及 packages/san-cli-docit-theme 的代码。

## 主要文件

Docit Theme 需要定义 Layout，Layout 主要内容是两个：

-   Main：主要 layout 的代码，layout 可以通过 package.json 的 layouts 来配置
-   CodeBox.san：CodeBox 是 sanbox 的模板，这个是 san 代码。

## Main

在 Main 中可以引入和使用的变量说明一下。

### 模板引入文档的内容

在模板 js 文件中，`$Page`是当前 Markdown 文档转换成的 San Component 对象，可以直接在内容中

-   `$Page.$toc`：当前文档的 TOC（Table Of Contents）对象，默认解析出`H2~3`，可以通过`markdown-loader`的`extractHeaders`数组来配置具体解析出来的 Header；
-   `$Page.$matter`：当前文档头部 FrontMatter 解析出来的对象；
-   `$Page.$link`：当前文档的链接。

### 在文档中引入配置等

-   `@sidebar`：`_sidebar.md`转换成 html 的内容，`_sidebar.md`是文档网站的侧边栏；
-   `@navbar`：`_navbar.md`转换成 html 的内容，`_navbar.md`是文档网站的导航条；
-   `@sitedata`：网站数据，即网站的`.docit.yaml`解析出来的 js 对象。

### exportType

在 js 文件中，可以直接`import` markdown 文件，在 san-markdown-loader 中可以支持导出类型（exportType），例如：

```js
// html:
import {Component} from 'san';
import Basic from './basic.md?exportType=html';

export default class Index extends Component {
    static template = `
        <div>
            <basic/>
        </div>
    `;
    static components = {
        basic: Basic
    };
}
```

在这里`import Basic from './basic.md?exportType=html'`得到的是不再是一个完整的文档+预览内容，而是得到预览部分代码的的 San 组件，通过这种方式可以直接预览 Markdown 文档中的代码部分效果。**可以用于移动页面嵌入 iframe 预览效果**

`exportType`支持三种类型：

-   data：这里导出的是 Markdown 内容转成的 js 对象；
-   html：返回的是经过 Markdown-it 处理之后的 html 片段；
-   matter：返回 Markdown 文件中的 frontMatter 信息。

## CodeBox.san

默认的 CodeBox.san 内容如下：

```html
<template>
    <section class="code-box {{isExpand?'expand':''}}">
        <section class="code-box-demo"><code-preview /></section>
        <section class="code-box-meta">
            <text-place-holder />
            <span class="code-expand-icon" on-click="toggleExpand">
                <img
                    alt="expand code"
                    src="https://gw.alipayobjects.com/zos/rmsportal/wSAkBuJFbdxsosKKpqyq.svg"
                    class="{{isExpand?'code-expand-icon-hide':'code-expand-icon-show'}}"
                />
                <img
                    alt="expand code"
                    src="https://gw.alipayobjects.com/zos/rmsportal/OpROPHYqWmrMDBFMZtKF.svg"
                    class="{{isExpand?'code-expand-icon-show':'code-expand-icon-hide'}}"
                />
            </span>
        </section>
        <section class="highlight-wrapper {{isExpand?'highlight-wrapper-expand':''}}">
            <code-place-holder />
        </section>
    </section>
</template>
<script>
    import CodeBox from '@docit/CodeBox';
    import TextTag from '@docit/Text';
    import HighlightCode from '@docit/HighlightCode';
    export default {
        initData() {
            return {
                isExpand: false
            };
        },
        components: {
            'code-preview': CodeBox,
            'text-place-holder': TextTag,
            'code-place-holder': HighlightCode
        },
        toggleExpand() {
            this.data.set('isExpand', !this.data.get('isExpand'));
        }
    };
</script>
```

**说明下**

-   `@docit/CodeBox`：是 Markdown 中的 sanbox 中提取出来的 san/js 代码转成的 San Component 对象；
-   `@docit/Text`：sanbox 中提取出来的 Markdown 内容转换成的 html 代码；
-   `@docit/HighlightCode`：是 sanbox 中 San Component 经过 Prismjs 的语法高亮。
