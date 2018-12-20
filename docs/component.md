# 组件开发
> 组件要求是不涉及具体业务的逻辑、粒度合理的单元。

组件分为项目公共组件、全局组件和页面级别组件三类。

* 公共组件：通过 npm 维护，项目使用`package.json`引入
* 全局组件：放到项目的`src/components/`，主要是全局性的，或通用性很强的组件，具备良好的封装性
* 页面级别组件：放在页面的`pages/xxx/components`下面维护，仅限本页面内使用

## 组件开发
组件项目目录结构可以通过`hulk`创建，目前我们提供基本的组件项目模板，使用下面命令创建：

```bash
hulk init component <folder-name>
```

创建后项目的目录结构如下：

```
├── README.md          # 组件介绍
├── __tests__          # 测试相关
│   └── index.spec.js
├── docs               # 文档相关
│   ├── basic.md
│   └── index.js
├── index.js
├── package.json
└── style
    └── index.less
```


## 调试

`docs`中的 index.js 是调试 demo 的入口，index.js 可以引入`markdown`文件，`markdown`文件中的代码会被执行，然后使用`hulk component docs/index.js`内容就会被展现出来。
例如：

```js
// index.js
import san from 'san';
import Readme from '../README.md';
import Basic from './basic.md';

export default san.defineComponent({
    components:{
        readme: Readme,
        demo: Basic
    },
    template: `
        <div>
            <readme/>
            <demo/>
        </div>
    `
})
```
下面是`basic.md`内容

```markdown

<text>
####
A AntDesign-San Component
</text>

\```html
<template>
  <div>
  	<h1>Hello World!</h1>
  	<s-test/>
  </div>
</template>
<script>
import test from '@/index';
export default {
    components: {
        's-test': test
    }
}
</script>
\```
```

使用`hulk component docs/index.js`的效果是在展现basic.md 中`html`的代码执行结果，并且显示文档`<text></text>`中的内容！
