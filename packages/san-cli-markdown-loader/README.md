# san-cli-markdown-loader

专门给 Component 命令使用的 markdown loader，会将 markdown 文档中的 demo 部分代码解析出来，生成可展现的 [San](https://baidu.github.io/san/) 组件。

## Usage

```js
{
    test: /\.md$/,
    use: [{loader: 'san-cli-markdown-loader': options: {template: 'path.template'}}]
}
```

## template 说明

支持自定义 template，默认 template 为：

```html
<template>
    <section class="code-box {{isExpand?'expand':''}}">
        <section class="code-box-demo"><code-preview /></section>
        <section class="code-box-meta markdown">
            <text-placeholder />
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
            <code-placeholder />
        </section>
    </section>
</template>
<script>
    export default {
        initData() {
            return {
                isExpand: false
            };
        },
        toggleExpand() {
            this.data.set('isExpand', !this.data.get('isExpand'));
        }
    };
</script>
```

特殊标签说明：

-   `<code-preview/>`： markdown 中的 `fence`部分 san 代码会被渲染出来的效果
-   `<text-placeholder/>`： markdown 中`text`标签内部的文案转 html
-   `<code-placeholder/>`：markdown 中的 `fence`部分 san 代码，被 prismjs 语法高亮

## 参数

-   ignore：正则忽略
-   template：模板路径
-   context：目录上下文
-   i18n = 'cn'：默认解析的文档语言

## Markdown 的 San 代码执行

1. 将代码由`<sambox>`标签包裹起来
2. 使用`:::`的扩展语法，定义文案部分，后面可以添加对应的文案语言，例如：`cn`，会根据 loader 配置的`i18n`来选取文案内容；
3. 使用`\`\`\`html`语法创建 San Component 代码

````md
<sanbox>
:::
#### 我是 title
这是是描述的内容
:::

```html
<template>
    <div id="hello-demo">
        <hello />
        <h2>{{text}}</h2>
    </div>
</template>
<style lang="less">
    @red: red;
    #hello-demo {
        h2 {
            color: @red;
        }
    }
</style>
<script>
    import Hello from './component.js';
    export default {
        initData() {
            return {
                text: '这里是副标题'
            };
        },
        components: {
            hello: Hello
        }
    };
</script>
```
````

</sanbox>
```

> 需要注意的是如果 js 的 `import` 路径可以通过`san.config.js`来设置对应的`alias`。

## 只展现`html`中的代码，不显示页面文档内容

新建`preview.js`，内容如下：

```js
import html from './markdownit.md?exportType=html';
import App from './markdownit.md?exportType=sanCode';
import App1 from './markdownit.md?exportType=sanCode&index=0';

console.log(html, App, App1);

// html:
import {Component} from 'san';
import Basic from './basic.md?exportType=component';

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

在这里`import Basic from './basic.md?exportType=component'`得到的是不再是一个完整的文档+预览内容，而是得到预览部分代码的的 San 组件，通过这种方式可以直接预览 Markdown 文档中的代码部分效果。**可以用于移动页面嵌入 iframe 预览效果**
