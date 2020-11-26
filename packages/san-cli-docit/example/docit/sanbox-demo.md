---
title: Docit Sanbox Demo
---

## Docit Sanbox Demo

<sanbox>
:::
#### What's Docit?
san docit 命令是放在`packages/san-cli-docit`中实现的，它是一个 Commander 插件，如果要编写自己的 Commander 插件可以参考它的代码。
:::

```html
<template>
    <div id="hello-sanbox">
        <hello />
        <h2>{{text}}</h2>
    </div>
</template>
<style lang="less">
    @red: red;
    #hello-sanbox {
        h1 {
            font-size: 18px;
        }
        h2 {
            font-size: 16px;
            color: @red;
        }
    }
</style>
<script>
    import Hello from './component.js';
    export default {
        initData() {
            return {
                text: 'Red, Less enabled!'
            };
        },
        components: {
            hello: Hello
        }
    };
</script>
```

</sanbox>

## Sanbox 复杂玩法，适合自定义

<sanbox>
:::
#### 说明
上面的内容是来自`./sanbox.js`，通过 picker 的 loader 单独引入对应模块来展现的。
:::

```html
<template>
    <div class="sanbox-demo">
        <h1>↓ 来自`?san-md-picker&get=sanbox&eq=0`</h1>
        <sanbox />
        <hr />
        <h1>↓ 来自`?san-md-picker&get=text-tag&eq=0`</h1>
        <text-tag />
        <hr />
        <h1>↓ 来自`?san-md-picker&get=highlight-code&eq=0`</h1>
        <highlight-code />
        <hr />
        <h1>↓ 来自`?san-md-picker&get=san-component&eq=0`</h1>
        <san-code />
    </div>
</template>
<style lang="less">
    @red: red;
    .markdown .sanbox-demo {
        h1 {
            font-size: 16px;
        }
    }
</style>
<script>
    import {Sanbox, TextTag, HighlightCode, SanCode} from './sanbox.js';
    export default {
        initData() {
            return {};
        },
        components: {
            sanbox: Sanbox,
            'text-tag': TextTag,
            'highlight-code': HighlightCode,
            'san-code': SanCode
        }
    };
</script>
```

</sanbox>
