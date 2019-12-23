
## 这里是 sanbox

<sanbox>
:::
#### 我是 title
这是是描述的内容222
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
                text: '这里是副标题2'
            };
        },
        components: {
            hello: Hello
        }
    };
</script>
```

</sanbox>
