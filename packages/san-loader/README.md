# San-Loader

San-Loader 是基于 webpack 的工具，允许开发者书写 San
单文件的方式来进行组件开发。

```html
<template>
    <div class="content">Hello {{name}}!</div>
</template>

<script>
    export default {
        initData() {
            return {
                name: 'San'
            };
        }
    };
</script>

<style>
    .content {
        color: blue;
    }
</style>
```

San 单文件在写法上与 Vue 类似，San-Loader 会将 `template`、`script`、`style` 等标签块当中的内容和属性提取出来，并交给 webpack 分别进行处理。最终单文件对外返回的将是一个普通的 San 组件类，我们可以直接使用它进行 San 组件的各种操作：

```js
import App from './App.san';
let app = new App();
app.attach(document.body);
```

## 使用方法

通过 npm 进行 San-Loader 的安装：

```shell
npm install --save-dev san-loader
```

然后在 webpack 的配置文件上增加一条规则应用到 `.san` 文件上，并且增加一个 SanLoaderPlugin：

```js
const SanLoaderPlugin = require('san-loader/lib/plugin');

module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.san$/,
                loader: 'san-loader'
            }
            // ...
        ]
    },
    plugins: [new SanLoaderPlugin()]
};
```

如前面提到，San-Loader 会将单文件的各个部分拆分出来，并交给其他的 Loader 来进行资源处理，因此还需要配置各个模块的处理方法，比如：

```js
const SanLoaderPlugin = require('san-loader/lib/plugin');

module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.san$/,
                loader: 'san-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
            // ...
        ]
    },
    plugins: [new SanLoaderPlugin()]
};
```

在默认情况下，`template`、`script`、`style` 会分别采用 `.html`、`.js`、`.css` 所对应的 Loader 配置进行处理，当然我们也可以在相应的标签上添加 `lang` 属性来指定不同的语言处理比如：

```html
<style lang="less">
    @grey: #999;

    div {
        span {
            color: @grey;
        }
    }
</style>
```

这样，对应的样式模块就可以当成 `.less` 文件进行处理，只需要配置上相应的 Loader 即可。

```js
// ...
module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    }
};
```

更加完整的 webpack 配置，可以参考示例：[San-Loader Webpack 配置实例](https://github.com/ecomfe/san-cli/blob/HEAD/packages/san-loader/examples/webpack.config.js)。

## Options

|       Name        |            Type            | Default  | Description                                                               |
| :---------------: | :------------------------: | :------: | :------------------------------------------------------------------------ |
| `compileTemplate` | <code>{'none'&#124;'aPack'&#124;'aNode'}</code> | `'none'` | 将组件的`template` 编译成`aPack`、`aNode`，**默认不编译**，详细见下面说明 |
| `esModule` | `{Boolean}` | `false` | san-loader 默认使用 CommonJS 模块语法来生成 JS 模块，将该参数设为 true 可以改用 ES 模块语法 |

**特殊说明：**

> `compileTemplate`：San 组件的`string`类型的`template`通过编译可以返回[aNode](https://github.com/baidu/san/blob/master/doc/anode.md)结构，在定义组件的时候，可以直接使用`aNode`作为 template，这样可以减少了组件的`template`编译时间，提升了代码的执行效率，但是转成`aNode`的组件代码相对来说比较大，所以在`san@3.9.0`引入的概念的`aNode`压缩结构`aPack`，**使用`aPack`可以兼顾体积和效率的问题**。san-loader 中的`compileTemplate`就是来指定要不要将组件编译为`aPack`/`aNode`。**如果只想，单文件使用`compileTemplate`编译成对应的`aPack`或者`aNode`，可以直接在`template`上面写：`<template compileTemplate="aPack">`**。

### 扩展阅读

-   [aNode 结构设计](https//github.com/baidu/san/blob/master/doc/anode.md)
-   [aPack: aNode 压缩结构设计](https://github.com/baidu/san/blob/master/doc/anode-pack.md)

## 单文件写法

### template

单文件中 `template` 模块的主要作用是提供一种更为便捷的方式来书写组件的 template 字符串。在配置 webpack 的时候，需要对 template 部分配置 raw-loader、html-loader 等等。其中如果 template 当中需要使用到图片、字体文件，建议采用 html-loader 配合 url-loader 的形式完成相关配置。例如：

```html
<template>
    <div>
        <img src="../assets/logo.png" />
    </div>
</template>
```

则需要在 webpack 配置文件当中增加如下配置：

```js
module.exports = {
    module: {
        rules: [
            // ...
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.png$/,
                loader: 'url-loader'
            }
        ]
    }
};
```

template 部分可以省略不写，直接在 script 模块当中定义也是可以的：

```html
<script>
    export default {
        template: '<div>{{name}}</div>'
    };
</script>
```

template 模块也支持通过 src 标签引入 template 文件：

```html
<template src="./component-template.html"></template>
```

> 注意：html-loader 最新版本在生产环境（[production](https://github.com/webpack-contrib/html-loader/blob/master/src/index.js#L38-L41)）会默认开启`minimize=true`，会导致 san 解析 template 失败，所以使用 html-loader 的时候建议开启`minimize=false`。

### script

script 模块必须通过 `export default` 将组件的 JS 代码导出。在写法上，支持类似 Vue 的写法：

```html
<script>
    export default {
        initData() {
            return {
                name: 'San'
            };
        }
    };
</script>
```

San-Loader 会自动为导出为普通对象的模块外部自动包上 `san.defineComponent` 使之成为真正的 San 组件。

```js
import script from './App.vue?san&type=script&lang=js';
import san from 'san';
// ...
export default san.defineComponent(script);
```

我们也可以通过 class 的方式：

```html
<script>
    import san from 'san';
    export default class App extends san.Component {
        initData() {
            return {
                name: 'San'
            };
        }
    }
</script>
```

也可以配合 san-store 一起使用，比如：

```html
<script>
    import san from 'san';
    import {store, connect} from 'san-store';
    import {builder} from 'san-update';

    // ...
    export default connect.san({
        name: 'user.name'
    })(
        san.defineComponent({
            // ...
        })
    );
</script>
```

总之在写法上与普通的 San 组件不存在太大区别，区别的地方只在于 template 和 style 的部分可以放到别的模块里进行书写。

当组件不依赖数据和计算的时候，script 块可以省略不写。

与 template 相似，script 模块也可以通过定义 src 属性导入相应的组件代码：

```html
<script src="./component-script.js"></script>
```

在默认情况下，script 模块的内容会被当成 `.js` 文件进行处理，如改成 TypeScript 的话，可以通过在 script 标签上添加属性 `lang="ts"` 将该模块标记为 `.ts` 文件，然后自行在 webpack 配置文件当中添加对 `.ts` 文件的处理 Loader 即可：

```html
<script lang="ts">
    // ...
</script>
```

这时候需要修改`ts-loader`配置：

```js
{
    test: /\.ts$/,
    loader: 'ts-loader',
    options: { appendTsSuffixTo: [/\.san$/] }
}
```

或者`babel-loader`的配置：

```js
{
    test: /\.ts$/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                plugins: [
                    require.resolve('@babel/plugin-proposal-class-properties'),
                    require.resolve('san-hot-loader/lib/babel-plugin')
                ],
                presets: [
                    [
                        require.resolve('@babel/preset-env'),
                        {
                            targets: {
                                browsers: '> 1%, last 2 versions'
                            },
                            modules: false
                        }

                    ],
                    // 下面配置 allExtensions
                    [require.resolve('@babel/preset-typescript'), {allExtensions: true}]
                ]
            }
        }
    ]
}
```

### style

style 模块用来书写组件的样式，在用法上与 template、script 类似，例如：

```html
<style>
    .parent {
        color: red;
    }

    .parent .children {
        color: green;
    }
</style>
```

在默认情况下，style 模块的内容会被当成 `.css` 文件处理，我们可以通过修改 `lang` 属性来指定文件类型。同时与 template、script 存在区别的地方在于，style 模块允许写多个，因此下面写的 style 模块都是有效的，全都会作用到当前的组件上：

```html
<template><!-- 组件模板  --></template>
<script>
    /* 组件 script */
</script>
<style>
    /* 写普通 css */
    .parent .children {
        color: green;
    }
</style>

<style lang="less">
    /* 写 less */
    @grey: #999;
    .parent {
        .children {
            background: @grey;
        }
    }
</style>
<!-- 引入外部 stylus 样式文件 -->
<style src="./component-style.styl"></style>
```

## CSS Modules

### 基本使用

[CSS Modules][css-modules] 是一个流行的用于模块化和组合 CSS 的系统，san-loader 提供了与 css-loader 的集成以支持 CSS Modules 的特性。在模板中可以这样写：

```html
<template>
    <div class="{{$style.wrapper}}"></div>
</template>

<script>
    export default {
        attached() {
            let style = this.data.get('$style');
            console.log(style);
        }
    };
</script>

<style module>
    .wrapper {
        color: black;
    }
</style>
```

如果要对所有文件生效，在上面的 webpack 配置示例中给 css-loader 添加 `modules` 参数即可。例如：

```javascript
// webpack.config.js 省略上下文
rules: [
    {
        test: /\.css$/,
        use: [
            'style-loader',
            {
                loader: 'css-loader',
                options: {
                    modules: {
                        localIdentName: '[local]_[hash:base64:5]'
                    },
                    localsConvention: 'camelCase',
                    sourceMap: true
                }
            }
        ]
    }
];
```

其中 `localIdentName` 用来指定编译后的类名，在开发环境请使用 `'[hash:base64]'`；
`localsConvention` 是在模板和 JavaScript 中引用的名称，默认是不转换，`'camelCase'` 是把类名转换为驼峰风格。详情请参考：[css-loader 文档][css-loader]。

### 允许非 CSS Modules

也可以指定部分 style 标签使用 CSS Modules，其他仍然是普通的全局 CSS：

```html
<style module>
    /* 这里是 CSS Modules */
</style>

<style>
    /* 这里是全局 CSS */
</style>
```

san-loader 会给带 `module` 的 `<style>` 添加对应的 `resourceQuery`，所以你可以这样配置：

```javascript
// webpack.config.js 省略上下文
rules: [
    {
        test: /\.css$/,
        oneOf: [
            // 这里匹配 `<style module>`
            {
                resourceQuery: /module/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[local]_[hash:base64:5]'
                            },
                            localsConvention: 'camelCase',
                            sourceMap: true
                        }
                    }
                ]
            },
            // 这里匹配 `<style>`
            {
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            }
        ]
    }
];
```

### 和预处理器一起使用

你也可以把 CSS Modules 和 LESS 等预处理器一起使用，添加对应的 loader 即可。比如：

```javascript
// webpack.config.js 省略上下文
rules: [
    {
        test: /\.less$/,
        oneOf: [
            // 这里匹配 `<style lang="less" module>`
            {
                resourceQuery: /module/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[local]_[hash:base64:5]'
                            },
                            localsConvention: 'camelCase',
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            }
            // 这里匹配 `<style lang="less">`
            // ...
        ]
    }
];
```

### 一些有用的用例

CSS Modules 可以在使用 slot 时使用（会被编译到随机的类名）：

```html
<template>
    <div>
        <child-component>
            <span class="{{$style.bold}}">foo</span>
        </child-component>
    </div>
</template>

<style module>
    .bold {
        font-weight: bold;
    }
</style>
```

也可以设置子组件的根元素样式（会被正确编译到随机类名）：

```html
<template>
    <div>
        <child-component class="child"></child-component>
    </div>
</template>

<style module>
    .child {
        font-weight: bold;
    }
</style>
```

但父组件无法覆盖子组件的内部类的样式，比如子组件内存在类名 `.foo`，父组件里的 `.child .foo` 不会渗透进入子组件：

```html
<template>
    <div>
        <child-component class="child"></child-component>
    </div>
</template>

<style module>
    .child .foo {
        font-weight: bold;
    }
</style>
```

但除类名之外的元素名、ID 等会渗透进入子组件，例如下面的 `.child span` 会作用于 `<child-component>` 里的 `<span>`：

```html
<template>
    <div>
        <child-component class="child"></child-component>
    </div>
</template>

<style module>
    .child span {
        font-weight: bold;
    }
</style>
```

[css-modules]: https://github.com/css-modules/css-modules
[css-loader]: https://github.com/webpack-contrib/css-loader#localsconvention
