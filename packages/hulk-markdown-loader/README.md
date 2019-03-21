# hulk-markdown-loader

专门给 Component 命令使用的 markdown loader，会将markdown 文档中的 demo 部分代码解析出来，生成可展现的 san。

## Usage

```js
{
    test: /\.md$/,
    use: ['hulk-san-loader', {loader: 'hulk-markdown-loader': options: {template: 'path.template'}}]
}
```

## template 说明

支持自定义 template，默认 template 为：

```html
<template>
    <section class="code-box {{isExpand?'expand':''}}" id="${id}">
        <section class="code-box-demo"><code-preview/></section>
        <section class="code-box-meta markdown">
            <text-container-placeholder/>
            <span class="code-expand-icon" on-click="toggleExpand">
                <img alt="expand code" src="https://gw.alipayobjects.com/zos/rmsportal/wSAkBuJFbdxsosKKpqyq.svg" class="{{isExpand?'code-expand-icon-hide':'code-expand-icon-show'}}">
                <img alt="expand code" src="https://gw.alipayobjects.com/zos/rmsportal/OpROPHYqWmrMDBFMZtKF.svg" class="{{isExpand?'code-expand-icon-show':'code-expand-icon-hide'}}">
            </span>
        </section>
        <section class="highlight-wrapper {{isExpand?'highlight-wrapper-expand':''}}"><code-container-placeholder/></section>
    </section>
</template>
<script>
    export default {
        initData() {
            return {
                isExpand: false
            }
        },
        toggleExpand() {
            this.data.set('isExpand', !this.data.get('isExpand'));
        }
    };
</script>
```

特殊标签说明：

* `<code-preview/>`： markdown 中的 `fence`部分san代码会被渲染出来的效果
* `<text-container-placeholder/>`： markdown 中`text`标签内部的文案转 html
* `<code-container-placeholder/>`：markdown 中的 `fence`部分san代码，被 prismjs 语法高亮
