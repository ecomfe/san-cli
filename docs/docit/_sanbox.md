## Docit Sanbox Demo

<sanbox>
:::
#### 说明
这段文字来自`_sanbox.md`.
:::

```html
<template>
    <div id="_sanbox">
        <h2>{{text}}</h2>
    </div>
</template>
<style lang="less">
    @red: red;
    #_sanbox {
        h2 {
            font-size: 14px;
            color: #1890ff;
        }
    }
</style>
<script>
    export default {
        initData() {
            return {
                text: 'From _sanbox.md.'
            };
        }
    };
</script>
```

</sanbox>
