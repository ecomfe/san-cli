# 组件开发

> 组件要求是不涉及具体业务的逻辑、粒度合理的单元。

组件分为项目公共组件、全局组件和页面级别组件三类。

-   公共组件：通过 npm 维护，项目使用`package.json`引入
-   全局组件：放到项目的`src/components/`，主要是全局性的，或通用性很强的组件，具备良好的封装性
-   页面级别组件：放在页面的`pages/xxx/components`下面维护，仅限本页面内使用

!> 更加详细的组件开发规范或者开发 Nano 组件，请参考 [Nano 组件库](http://hulk.baidu-int.com/docs/nano)规范！

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
    components: {
        readme: Readme,
        demo: Basic
    },
    template: `
        <div>
            <readme/>
            <demo/>
        </div>
    `
});
```

下面是`basic.md`内容

````markdown
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
````

使用`hulk component docs/index.js`的效果是在展现 basic.md 中`html`的代码执行结果，并且显示文档`<text></text>`中的内容！

> Tips：`hulk commponent` 命令可以用`hulk md`代替

## 只展现`html`中的代码，不显示页面文档内容

新建`preview.js`，内容如下：

```js
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

`exportType`支持三种类型：

-   app：默认，即通常的用法，会返回`template`转成的 doc+预览的效果，可以修改 template 模板的方式来修改样式
-   object：返回的是包含 text、sanComponent 和 code 的对象，在`index.js`中可以自由使用灵活度较高；
-   component：仅仅返回 markdown 文档中的代码部分 san 组件，用于只显示预览效果。


## 最佳实践

-   使用`@baidu/prefix-classnames`生成 className

例如：

```js
import san, {DataTypes} from 'san';
import prefixClassNames from '@baidu/prefix-classnames';

const prefixCls = 's-test';
const classNames = prefixClassNames(prefixCls);
// classNames() → s-test
// classNames({a: true}) → s-test s-test-a
// classNames({a: true}, b) → s-test s-test-a s-test-b
// 我们推荐使用 Component extend 方式写组件！！！这样支持 hmr
// 不推荐使用 san.defineComponent 方法
export default san.defineComponent({
    trimWhitespace: 'all',
    template: `
        <div class="${classNames()}">
            <h2 class="{{h2ClassName}}">Hi~</h2>
        </div>
    `,
    dataTypes: {
        test: DataTypes.any
    },
    computed: {
        h2ClassName() {
            return classNames(
                {
                    h2: true
                },
                'demo'
            );
        }
    },
    initData() {
        return {};
    }
});
```
