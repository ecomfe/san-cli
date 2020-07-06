# San-Hot-Loader

San-Hot-Loader 为基于 Webpack 构建的 [San](https://github.com/baidu/san) 项目提供热更新功能。能够让 San 项目在调试开发的时候变得更加方便。

## 安装

**代码1-1**
```shell
$ npm install --save-dev san-hot-loader
```

## 配置

您需要在 Webpack 配置文件当中添加 san-hot-loader 相关配置信息。完整的配置信息可参考示例项目当中的 [webpack.config.js](./examples/component-hmr/webpack.config.js) 配置，其中与 san-hot-loader 有关的配置如下所示：

**代码2-1**
```js
module.exports = {
    // ... 其他的 webpack 配置信息

    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['san-hot-loader']
            }
            // ... 其他的 loader 信息
        ]
    }
}
```

这样，在启动 webpack 进行代码调试的时候，就自动实现了 San 组件与 San-Store 的热更新功能。

> **需要注意的是**，当项目代码使用了 ES7 及以上的语法时，通常需要 babel-loader 将代码进行转换成 ES5 语法，这个转换过程可能会带来额外的 Babel Helper、Polyfill 代码的注入，在这种情况下，san-hot-loader 同时也提供了 babel 插件来实现热更新代码注入：


**代码2-2**
```js
module.exports = {
    // ... 其他的 webpack 配置信息

    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    // 'san-hot-loader',
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                // 通过 babel plugin 的形式添加
                                require.resolve('san-hot-loader/lib/babel-plugin')
                            ]
                        }
                    }
                ]
            }
            // ... 其他的 loader 信息
        ]
    }
}
```

## 使用

在默认情况下，san-hot-loader 自动开启对 San 组件与 San-Store 模块的热更新代码注入，通过自动检测的手段来判断哪些是 San 组件，哪些是 San-Store 模块。

### San 组件格式

#### 常规 San 组件格式

一个简单的常规 San 组件文件如下所示：

**代码3-1**
```js
// app.js
import san from 'san';

export default san.defineComponent({
    template: '<p>Hello {{name}}</p>',
    initData: function () {
        return {name: 'San'};
    }
});
```

也可以采用 class 的方式：

**代码3-2**
```js
import {Component} from 'san';
export default class App extends Component {
    static template = '<p>Hello {{name}}</p>';
    initData() {
        return {name: 'San'};
    }
}
```
或者采用 ES5 Function Constructor 的方式来定义组件：

**代码3-3**
```js
var san = require('san');

function App(options) {
    san.Component(this, options);
}
san.inherits(App, san.Component);
App.prototype.template = '<p>Hello {{name}}</p>';
App.prototype.initData = function () {
    return {name: 'San'};
};
module.exports = App;
```

基于上述例子不难看出，一个功能完整的组件代码文件应包含以下特征：

1. 文件引入 `san` 模块（`import`、`require`）；
2. 使用 `san` 模块所提供的 API（defineComponent、Component）定义组件；
3. 将定义好的组件作为默认模块导出（`export default`、`module.exports`）；

以上就是 san-hot-loader 判断文件是否为普通 San 组件的方法。

#### 结合 San-Store 的组件写法

当项目使用 San-Store 时，根据相关文档的说明，需要使用 `san-store` 提供的 connect 方法将状态源与组件关联起来，如：

**代码3-4**
```js
import {defineComponent} from 'san';
import {connect} from 'san-store';
import './register-store-actions';

const App = defineComponent({
    template: '<p>Hello {{name}}</p>',
    initData: function () {
        return {name: 'San'};
    }
});
// connect 到默认 store
const NewApp = connect.san({name: 'name'})(App);
export default NewApp;
```

或者：

**代码3-5**
```js
import {defineComponent} from 'san';
import {connect} from 'san-store';
import store from './store';

const App = defineComponent({
    template: '<p>Hello {{name}}</p>',
    initData: function () {
        return {name: 'San'};
    }
});
// connect 到自定义 store
const connector = connect.createConnector(store);
const NewApp = connector({name: 'name'})(App);
export default NewApp;

```

因此在这种情况下，san-hot-loader 对于满足以下特征的文件，也同样能够识别为 San 组件：

1. 文件引入 `san-store`（`import`、`require`）；
2. 使用 `san-store` 提供的 `connect.san` 或 `connect.createConnector(store)` 得到的方法连接 store 与当前 San 组件获得新的组件；
3. 将得到的新组件作为默认模块导出（`export default`、`module.exports`）；

### San-Store 模块写法

san-hot-loader 为 san-store 提供了 action 的热更新功能，即在修改 san-store 注册 action 的文件时，store 与组件所保存的状态都不会丢失，并且在触发 action 时自动使用最新的 action。

san-store 提供了默认 store 和自定义 store 两种，因此在支持 san-hot-loader 自动识别的写法上也存在不同。

#### 默认 store

san-store 提供了默认 store 实例，在使用上可以通过 `import {store} from 'san-store'` 获取该实例对象，调用其 `addAction` 方法可以完成对默认 store 的 action 注册。

一个简单的对默认 store 实例注册 action 的代码如下所示：

**代码3-6**
```js
// register-store-actions.js
import {store} from 'san-store';
import {builder} from 'san-update';
store.addAction('increase', function (num) {
    builder().set('num', num + 1);
});

store.addAction('decrease', function (num) {
    builder().set('num', num - 1);
});
```

这个文件会被 san-hot-loader 成功识别，并注入热更新代码。该文件可以参考前面的代码3-4 的方式引入到项目当中。

它应具有以下特征：

1. 文件引入 `san-store`；
2. 使用 `san-store` 提供的 store.addAction 方法注册 action；
3. 文件不存在任何模块导出（`export`、`export default`、`module.exports`、`exports.xxx`）；

在这里需要解释一下特征 3。首先，在对默认 store 实例注册 action 之后，可以直接使用 `san-store` 提供的 `connect.san` 方法对 San 组件进行关联，因此无需对默认 store 实例做任何的模块导出；其次，热更新的本质是前端异步接收更新后的文件模块，并进行替换，在这里 san-hot-loader 只针对注册 action 的功能进行了替换处理，如果文件存在模块导出，san-hot-loader 无法去跟踪处理相应行为从而会导致热更新出错。所以要求文件不存在任何模块导出。

#### 自定义 store

san-store 提供了自定义 store 的方法来满足开发者多 store 的状态管理需求。一个简单的自定义 store 代码如下所示：

**代码3-7**
```js
// store.js
import {Store} from 'san-store';
import {builder} from 'san-update';

export default new Store({
    initData: {
        num: 0
    },
    actions: {
        increase(num) {
            return builder().set('num', num + 1);
        },
        decrease(num) {
            return builder().set('num', num - 1);
        }
    }
});
```
通过类似前面代码3-5 的写法使用自定义 store，同样地，在修改自定义 store 文件时，同样也能够获得热更新效果。

需要注意的是，在这种自定义 Store 的情况下，只有在修改 `actions` 部分的代码会实现热更新，当 initData 部分出现改动时，则会直接进行页面重载。

自定义 store 的文件应具有以下特征：

1. 文件引入 `san-store`；
2. 使用 `san-store` 提供的 `Store` 方法实例化自定义 store；
3. 将自定义 store 以默认模块导出；

### 特殊注释

前面给出了符合 san-hot-loader 满足热更新自动检测的一些文件写法，在某些情况下可能会存在以下情况：

1. 文件不希望被热更新；
2. 文件希望被热更新，但是由于没有被自动检测到而热更新失效；

针对这种情况，除了可以采用下文所提到的 san-hot-loader 配置指定之外，还可以直接在书写具体工程代码的时候，通过添加一些特殊的注释进行标记，san-hot-loader 会去检测这些特殊的注释去执行相应的操作。

#### 禁止热更新

在文件头部或尾部添加以下注释，即可达到禁止该文件被热更新的效果：

```js
/* san-hmr disable */

import san from 'san';

export default san.defineComponent({
    template: '<div>hello world</div>'
});
```

#### 开启热更新

热更新包括组件热更新和 San-Store 热更新。

组件热更新需要满足的条件是：当前文件默认导出的模块组件对象。在满足该前提下，可以使用以下注释指定热更新：

```js
// ./component.js
import sanComponentWrapper from './wrapper'
import componentDescriptor from './descriptor';

export default sanComponentWrapper(componentDescriptor);

/* san-hmr component */
```

其中：

```js
// ./wrapper.js

import san from 'san';
export default function (descriptor) {
    return san.defineComponent(descriptor);
}

// ./descriptor.js

export default {
    template: '<div>hello world</div>'
}
```

很明显在上述的示例代码当中 component.js 是无法被 san-hot-loader 自动检测判定为 San 组件文件，因此可以通过注释 `/* san-hmr component */` 主动告知对该文件执行热更新。

同样，对于 San-Store 也可以使用 `/* san-hmr store */` 来实现对 Store 的热更新：

```js
import store from './custom-store.js';

store.addAction('increase', )
```

```js
// ./custom-action.js
import store from './custom-store';
import {builder} from 'san-update';
store.addAction('increase', function (num) {
    builder().set('num', num + 1);
});

store.addAction('decrease', function (num) {
    builder().set('num', num - 1);
});

/* san-hmr store */
 ```

其中：

```js
// .custom-store.js
import {Store} from 'san-store';
export default new Store({
    initData: {
        num: 0
    }
});
```

在这种情况下，san-hot-loader 无法通过自动检测手段判定 ./custom-action.js 需要执行热更新，因此可以通过 `/* san-hmr store */` 进行标记。

## 配置

san-hot-loader 提供一系列配置，通过 webpack loader 的 `options` 配置项传入，如果使用的是 babel 插件时，在配置上也是一样的：


```js
// webpack loader 配置
module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'san-hot-loader',
                        options: {
                            enable: process.env.NODE_ENV === 'development',
                            component: {
                                patterns: [
                                    /\.san\.js$/,
                                    'auto'
                                ]
                            },
                            store: {
                                patterns: [
                                    function (resourcePath) {
                                        return /\.store\.js$/.test(resourcePath);
                                    },
                                    'auto'
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }
}
```

```js
// Babel Plugin 配置
module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                [
                                    'san-hot-loader',
                                    {
                                        enable: process.env.NODE_ENV === 'development',
                                        component: {
                                            patterns: [
                                                /\.san\.js$/,
                                                'auto'
                                            ]
                                        },
                                        store: {
                                            patterns: [
                                                function (resourcePath) {
                                                    return /\.store\.js$/.test(resourcePath);
                                                },
                                                'auto'
                                            ]
                                        }
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        ]
    }
}

```

接下来将详细介绍 san-hot-loader 配置项的使用方法。

### enable

- enable `{boolean}` 是否使能该 loader，默认值为 true。一般配合环境变量一起使用，如：

```js
// webpack.config.js
{
    loader: 'san-hot-loader',
    options: {
        enable: process.env.NODE_ENV !== 'production'
    }
}
```

### component.enable

- component.enable `{boolean}` 是否开启 San 组件热更新，默认值为 true，即默认开启：

```js
{
    loader: 'san-hot-loader',
    options: {
        component: {
            enable: false // 关闭 San 组件热更新
        }
    }
}
```

### component.patterns

- component.patterns `{Array.<Object>}` 开启热更新的 San 组件的路径匹配模式，默认值为：`[{component: 'auto'}]`，即采取自动检测的模式。

其中 `component` 的取值除了 `'auto'` 之外，还可以传入正则表达式和函数来对进行文件路径匹配，比如：

```js
{
    loader: 'san-hot-loader',
    options: {
        component: {
            patterns: [
                /\.san\.js$/,
                function (resourcePath) {
                    // resourcePath 为当前资源的绝对路径
                    // return true 则表示匹配成功
                    return /\.san\.js$/.test(resourcePath);
                },
                'auto'
            ]
        }
    }
}
```

san-hot-loader 会优先匹配到后缀为 `.san.js` 的文件时，会直接向该文件注入热更新代码，匹配失败后，再按顺序执行剩余的匹配规则。

### store.enable

- store.enable `boolean` 是否开启 San-Store 热更新，默认为 true，即默认开启：

```js
{
    loader: 'san-hot-loader',
    options: {
        store: {
            enable: false
        }
    }
}
```

### store.patterns

- store.patterns `{Array.<Object>}` 开启热更新的 San Store 模块路径匹配模式，默认值为：`['auto']`，即采取自动检测的模式。

无论是使用 san-store 提供的全局 store 还是自定义 store，同样也可以通过正则表达式和函数的方式去指定文件，在规则上与 component 配置一致：

```js
{
    loader: 'san-hot-loader',
    options: {
        store: {
            patterns: [
                /\.store\.js$/,
                function (resourcePath) {
                    return /\.store\.js$/.test(resourcePath);
                },
                'auto'
            ]
        }
    }
}
```

## 示例

项目 examples 提供了一个简单但功能完整的[示例](./examples/hmr)，可以将本项目 clone 下来，运行该示例，并尝试修改示例当中的代码来感受热更新为开发所带来的便利。


