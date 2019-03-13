# hulk component


## Usage

```bash
hulk init component path_component
cd path_component
hulk component doc/index.js
```

## hulk.config.js

```js
{
    component: {
        entry, // 自定义的入口 js，`~entry`是 markdown内容，需要在这个 js引入
        template, // 对应 hulk-markdown-loader的 template，详见 hulk-markdown-loader内容
        ignore// 忽略的文件
    }
}
```
