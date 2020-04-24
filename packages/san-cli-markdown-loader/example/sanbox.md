
## 这里是 sanbox

<sanbox>
:::
#### 我是sanbox中的 title
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

</sanbox>


## 这里是 sanbox1

<sanbox>
:::
#### 我是sanbox中的 title
这是是描述的内容
:::

```js
import Hello from './component.js';
console.log(Hello)
```

</sanbox>


