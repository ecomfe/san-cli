# 插件对象

## PluginManager对象

PluginManager是整个`San CLI UI`插件系统的基础，该对象的方法按照功能可分为四类。

> 上文提到，在`San CLI UI`加载依赖时，会尝试读取依赖包内的ui.js文件，并将PluginManager对象的实例api注入其中，因此以下插件的使用均基于api来调用。

### 1. 插件加载及定义
#### 插件加载

通过`api.registerAddon`函数，开发者可以为自定义的组件指定id及加载路径（在npm包内的ui.js中），`San CLI UI`在插件加载时，会尝试从开发者指定的路径下加载插件定义，从而集成到`San CLI UI`对应位置。

##### API 说明
**registerAddon**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 插件唯一id | string | 无 |
| url | 可选，开发模式下加载的url | string | 无 |
| path | npm包的路径 | string | 无 |


API使用方式如下：

```js
if (process.env.SAN_CLI_UI_DEV) { // 在开发模式下加载自定义端口文件
    api.registerAddon({
        id: 'san.widgets.client-addon.dev',
        url: 'http://localhost:8889/index.js'
    });
}
else {
    api.registerAddon({ // 在生产模式下加载npm包的路径
        id: 'san.widgets.client-addon',
        path: 'san-cli-ui-addon-widgets/dist'
    });
}
```

`api.registerAddon`仅实现了插件包的加载，而加载的插件显示在何处？插件的显示项以及数据操作逻辑则需要单独调用每个插件的api进行描述。

`San CLI UI`中可以注册的插件类型包括：widget插件、配置插件、任务插件、自定义视图插件。

#### widget插件

widget（部件）插件，指显示在「项目仪表盘」内的小部件，`San CLI UI`默认部件有：欢迎提示、运行任务、终止端口、新闻订阅。

通过`api.registerWidget`方法，开发者可实现自定义的部件，显示在仪表盘内。

##### API 说明
**registerWidget**:

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 必选，部件唯一的 ID | string | 无 |
| title | 必选，部件的名称 | string | 无 |
| description | 必选，部件的描述 | string | 无 |
| icon | 必选，组件的icon，取值可选santd内的icon类型 | string | 无 |
| component |  必选，加载的动态组件id，会用 ClientAddonApi 进行注册 | string | 无 |
| defaultHeight | 组件的默认高度（与最大最小高度可以选填） | number | 无 |
| defaultWidth | 组件的默认宽度（与最大最小宽度可以选填） | number | 无 |
| minHeight | 组件的最小高度 | number | 无 |
| minWidth | 组件的最小宽度 | number | 无 |
| maxHeight | 组件的最大高度 | number | 无 |
| maxWidth | 组件的最大宽度 | number | 无 |
| openDetailsButton | 是否显示部件右上角展示详情按钮，默认不显示 | boolean | false |
| needsUserConfig | 是否显示部件右上角配置按钮，默认不显示 | boolean | false |
| onConfigOpen | 当点击右上角配置按钮时，返回此函数配置的表单格式 | function({context}) | 无 |
| defaultConfig | onConfigOpen配置的表单的默认值 | function() | 无 |
| onAdded | 将部件从列表添加到仪表盘页面时触发此函数 | function({widget, definition}) | 无 |
| onRemoved | 将部件从仪表盘页面移除时触发此函数 | function({widget, definition}) | 无 |


API使用方式如下：

```js
api.registerWidget({
    id: 'san.widgets.test', // 必选，唯一的 ID
    title: 'title', // 必选，组件的名称
    description: 'description',  // 必选，组件的描述
    icon: 'info-circle', // 必选，组件的icon，取值可选santd内的icon类型
    component: 'san.widgets.components.test-widget', // 必选，加载的动态组件，会用 ClientAddonApi 进行注册
    minWidth: 6, // 宽度
    minHeight: 1, // 高度
    maxWidth: 6,
    maxHeight: 6,
    defaultWidth: 5, // 必选
    defaultHeight: 2, // 必选
    openDetailsButton: false, // 可选
    defaultConfig: () => ({  // 可选，如果有prompt表单，返回默认配置
        hi: 'hello'
    }),
    async onConfigOpen() {  // 可选，返回表单配置
        return {
            prompts: [
                {
                    name: 'hi',
                    type: 'input',
                    message: '',
                    validate: input => !!input
                }
            ]
        };
    }
});
```

#### 配置插件

配置插件主要用于在配置管理中，将项目中配置文件的修改变为可视化的表单操作，方便用户理解并修改配置项。目前`San CLI UI`内默认配置项包含`san.config.js`和`eslint`的配置。

通过调用`api.registerConfig`可以更改项目的配置，此函数返回一个符合[inquirer.prompts](https://github.com/SBoudrias/Inquirer.js)格式的对象，`San CLI UI`内支持的 inquirer 类型有：checkbox、confirm、input、list、string。通过该对象生成表单，可在项目配置中显示并修改具体项目的配置。
##### API 说明：

**registerConfig**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 必选，配置项的唯一id | string | 无 |
| name | 必选，配置项的展示名称 | string | 无 |
| description | 必选，配置项的展示描述 | string | 无 |
| icon | 配置项的图标，取值可选santd内的icon类型或静态图片链接 | string | 无 |
| link |  配置项更多的链接 | string | 无 |
| files | 提供配置项需要检测的配置文件，支持的类型有：json、yaml、js、package| object | 无 |
| onRead | 配置详情页面显示的表单对象，对于每个配置项都包含一个描述，整体格式符合inquirer.prompts对象 | onRead: ({data}) => ({prompts: [...]}) | 无 |
| onWrite | 数据写入配置文件触发的钩子，可在此执行node.js的代码 | onWrite: ({ prompts, answers, data, files, cwd, api }) => {...}) | 无 |

**onRead**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 必选，配置项的唯一id | string | 无 |
| name | 必选，配置项的展示名称 | string | 无 |
| description | 必选，配置项的展示描述 | string | 无 |
| icon | 配置项的图标，取值可选santd内的icon类型或静态图片链接 | string | 无 |
| link |  配置项更多的链接 | string | 无 |
| files | 提供配置项需要检测的配置文件，支持的类型有：json、yaml、js、package| object | 无 |
| onRead | 配置详情页面显示的表单对象，对于每个配置项都包含一个描述，整体格式符合inquirer.prompts对象 | onRead: ({data}) => ({prompts: [...]}) | 无 |
| onWrite | 数据写入配置文件触发的钩子，可在此执行node.js的代码 | onWrite: ({ prompts, answers, data, files, cwd, api }) => {...} | 无 |

通过onRead函数返回的对象，符合[inquirer.prompts]()格式，支持配置单个表单或带多个选项卡的表单

```js
// 配置多个表单
api.registerConfig({
  /* ... */
  onRead: ({ data, cwd }) => ({
    tabs: [
      {
        id: 'tab1',
        label: 'My tab',
        // 可选的
        icon: 'application_settings',
        prompts: [
          // 表单对象
        ]
      },
      {
        id: 'tab2',
        label: 'My other tab',
        prompts: [
          // 表单对象
        ]
      }
    ]
  })
})
```

**onWrite**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| prompts | 运行时表单对象 | string | 无 |
| answers | 用户输入的回答数据 | string | 无 |
| data |从配置文件读取的只读的初始化数据 | string | 无 |
| files | 被找到的文件的描述器 ({ type: 'json', path: '...' }) | string | 无 |
| cwd |  当前工作目录 | string | 无 |
| api | 写入api辅助函数 | object | 无 |

**onWrite.api**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| assignData(fileId, newData) | 在写入前使用 Object.assign 来更新配置文件 | function | 无 |
| setData(fileId, newData) | newData 的每个 key 在写入之前都将会被深设置在配置数据上 (或当值为 undefined 时被移除)。 | function | 无 |
| async getAnswer(id, mapper) | 为一个给定的表单 id 获取答案，并通过可能提供了的 mapper 函数 (例如 JSON.parse) 进行 map 处理。 | function | 无 |

其中prompts对象格式：
```js
{
    id: data.name,
    type: data.type,
    name: data.short || null,
    message: data.message,
    group: data.group || null,
    description: data.description || null,
    link: data.link || null,
    choices: null,
    visible: true,
    enabled: true,
    // 当前值 (未被过滤的)
    value: null,
    // 如果用户修改过了则为 true
    valueChanged: false,
    error: null,
    tabId: null,
    // 原始的 inquirer 提示符对象
    raw: data
}
```

API使用方式如下：

```js
	// san.config.js的配置
    api.registerConfig({
        id: 'san.san-cli', // 配置项的id
        name: 'San CLI',
        description: 'configuration.san-cli.description',
        link: 'https://ecomfe.github.io/san-cli/#/config',
        files: {
            san: {
                js: ['san.config.js']
            }
        },
        icon: iconUrl,
        onRead: ({data}) => ({
            prompts: [
                {
                    name: 'publicPath',
                    type: 'input',
                    default: '/',
                    value: data.san && data.san.publicPath,
                    message: 'configuration.san-cli.publicPath.label',
                    description: 'configuration.san-cli.publicPath.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                ...
            ]
        }),
        onWrite: async ({api, prompts}) => { // 在写入时显示
            const sanData = {};
            for (const prompt of prompts) {
                sanData[prompt.id] = await api.getAnswer(prompt.id);
            }
            api.setData('san', sanData);
        }
    });
```

##### 配置文件

在`registerConfig`配置项`files`中可以声明多个配置文件，例如 .eslintrc 和 san.config.js，支持的类型有：json、yaml、js、package。配置时需要严格按照次顺序，如果这项配置不存在，则会创建列表中的第一个文件。例如:

```js
    api.registerConfig({
        id: 'san.eslintrc',
        name: 'ESLint configuration',
        description: 'configuration.eslint.description',
        link: 'https://eslint.org',
        files: {
            eslint: {
                js: ['.eslintrc.js'],
                json: ['.eslintrc', '.eslintrc.json'],
                yaml: ['.eslintrc.yaml', '.eslintrc.yml'],
                // 会从 `package.json` 读取
                package: 'eslintConfig'
            }
        },
        ...
    )
```
配置文件的内容与读取数据的对应关系如下：

```js
// ui.js
api.registerConfig({
        id: 'san.san-cli', // 配置项的id
        name: 'San CLI',
        description: 'configuration.san-cli.description',
        link: 'https://ecomfe.github.io/san-cli/#/config',
        files: {
            san: {
                js: ['san.config.js']
            }
        },
}
// san.config.js
{
    assetsDir: STATIC_PRO,
    publicPath: '/',
    outputDir: 'dist',
    filenameHashing: isProduction,
    css: {
        sourceMap: isProduction,
        cssPreprocessor: 'less',
        extract: true
    },


    pages: {
        index: {
            entry: './pages/index.js',
            filename: 'index.html',
            template: './assets/index.html',
            title: '项目管理器 - san ui',
            chunks: ['index', 'vendors']
        }
    },
    ...
}
// 读取到cli ui后
{
	san: {
		assetsDir: STATIC_PRO,
    	publicPath: '/',
    	outputDir: 'dist',
    	filenameHashing: isProduction,
    	css: {
        	sourceMap: isProduction,
        	cssPreprocessor: 'less',
        	extract: true
    	},
    	pages: {
        	index: {
            	entry: './pages/index.js',
            	filename: 'index.html',
            	template: './assets/index.html',
            	title: '项目管理器 - san ui',
            	chunks: ['index', 'vendors']
        	}
    	}
    ...
	}
}
```

#### 任务插件

在项目任务中展示的任务项，生成自项目 package.json 文件的 scripts 字段。

`San CLI UI`默认内置了`san serve`、`san build`、`san inspect`三个命令的增强任务，包括：`start`、`build`、`analyzer`、`build:modern`、`inspect`几个任务。

通过`api.registerTask` 方法，实现任务的“增强”，为任务增加额外的信息和显示，并能在对应的调用周期下实现附加功能。

#### API 说明
**registerTask**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| match | 正则匹配对应的命令 | reg | 无 |
| description | 任务对应的描述 | string | 无 |
| icon | 任务的图标，取值可选santd内的icon类型或静态图片链接 | string | 无 |
| link |  任务说明的链接 | string | 无 |
| prompts | 返回任务可配置项的表单，整体格式符合inquirer.prompts对象 | object | 无 |
| onBeforeRun | 启动任务之前的钩子函数，可以修改任务参数 | onBeforeRun: async ({ answers, args }) => {}) | 无 |
| onRun | 任务运行之后立即调用的钩子函数 | onRun: async ({ args, child, cwd }) => {}),child: Node 子进程,cwd: 进程所在目录 | 无 |
| onExit | 任务退出后触发的钩子函数 | onExit: async ({ args, child, cwd, code, signal }) => {}) code：退出码 | 无 |
| views | 额外的视图，默认情况下，这里是展示终端输出的 `dashboard` 视图 | array | 无 |
| defaultView | 展示任务详情时默认选择的视图 (默认是 `dashboard`) | string | 无 |

API使用方式如下：

```js
api.registerTask({
    // 匹配san serve
    match: /san(-cli\/index\.js)? serve(\s+--\S+(\s+\S+)?)*$/,
    description: 'task.description.serve',
    link: 'https://ecomfe.github.io/san-cli',
    icon: sanIcon,
    prompts: [
        {
            name: 'open',
            type: 'confirm',
            default: false,
            message: 'task.serve.open'
        },
        ...
    ],
    onBeforeRun: ({answers, args}) => {
        ...
    },
    onRun: () => {
        ...
    },
    onExit: () => {
        ...
    },
    views: [
        {
            id: 'san.cli-ui.views.dashboard',
            label: 'addons.dashboard.title',
            component: 'san.cli-ui.components.dashboard'
        },
        ...
    ],
    defaultView: 'san.cli-ui.views.dashboard'
});

```
### 自定义视图插件与自定义路由插件

开发者可以使用`api.registerView`创建自定义视图，结合使用`ClientAddonApi.addRoute`创建自定义路由跳转该视图。

在ui.js通过`api.registerView`注册的视图，在服务端触发视图增加的subscription监听，将新增的页面路径及名称推送到客户端显示，而客户端组件加载时，已通过ClientAddonApi.addRoute将路由加载到san-router，当点击跳转时，就如处理`San CLI UI`默认路由一般，跳转至对应自定义组件页面。

#### API 说明

**api.registerView**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 视图id，使用 'ClientAddonApi.addRoutes' 方法中相同的id | string | 无 |
| name | 视图显示名称 | string | 无 |
| icon | 按钮图标名称（santd的图标类型） | string | 无 |

API使用方式如下：

```js
api.registerView({
    id: 'san.myviews.views',
    name: '我的视图',
    // Santd的图标
    icon: 'smile'
});

```

**api.registerView**通常需要配合`ClientAddon`对象的`ClientAddonApi.addRoute`方法一同使用：

```js
import Myview from './components/myview';

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    // 注意这里第一个参数，应registerView的id参数相同，这里会创建一个'/addon/san.myviews.views' 路由
    ClientAddonApi.addRoutes('san.myviews.views', Myview);
}

```

## 2. 事件交互

### prompts表单对象
prompts对象必须是合法的 [inquirer](https://github.com/SBoudrias/Inquirer.js) 对象。基本的结构如下：

```js
{
    id: data.name,
    type: data.type,
    visible: true,
    enabled: true,
    name: data.name || null,
    message: data.message,
    placeholder: data.placeholder || null,
    group: data.group || null,
    description: data.description || null,
    link: data.link || null,
    choices: null,
    value: null,
    valueChanged: false,
    error: null,
    tabId: data.tabId || null,
    formItemLayout: data.formItemLayout || {},
    raw: data
}

```

支持的 inquirer 类型有：checkbox、confirm、input、list、string。

confirm类型的组件会以一个switch按钮展示，使用例子如下：

```js

{
    name: 'sourceMap',
    type: 'confirm',
    default: true,
    value: false,
    // 名称
    message: '在生产环境启用 Source Map',
    // 附加描述
    description: '如果你不需要生产环境下的 source map，禁用此项可以加速生产环境构建。',
    // 用来将提示符按章节分组
    group: '基础设置',
    // “More info”链接
    link: 'https://ecomfe.github.io/san-cli/#/config'
}

```

input类型的组件会以一个输入框展示，使用例子如下：

```js
{
    name: 'publicPath',
    type: 'input',
    default: '/',
    value: '/',
    message: '在生产环境启用 Source Map',
    description: '如果你不需要生产环境下的 source map，禁用此项可以加速生产环境构建。',
    group: '基础设置',
    link: 'https://ecomfe.github.io/san-cli/#/config'
}
```

list类型的组件会以一个下拉列表框展示，使用例子如下：


```js
{
    name: 'import/unambiguous',
    type: 'list',
    message: '代码质量和纠错',
    value: 1,
    choices: [
        {
            name: '关闭',
            value: 0
        },
        {
            name: '警告',
            value: 1
        },
        {
            name: '错误',
            value: 2
        }
    ]
}
```

### 插件action

插件的action是`San CLI UI`的插件在浏览器端和Node.js之间的事件调用监听机制，例如终止端口插件的终止按钮，在按下后，会利用此api向node端传递需要杀死的端口，进而调用kill函数完成功能。


#### API 说明

**api.callActionw**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 需要触发的action的唯一id | string | 无 |
| params | action的参数 | Object | 无 |

**api.onAction**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 需要监听的action的id | string | 无 |
| callback | 监听到action后执行的回调函数 | function | 无 |

使用方式如下

```js
    // 调用一个 action
    api.callAction('san.widgets.actions.kill-port', {
        port: 8080
    }).then(results => {
        console.log(results)
	}).catch(errors => {
  		console.error(errors)
    })
    // 监听一个 action
    api.onAction('san.widgets.actions.kill-port', async params => {
        ...
        return {
            status: res
        };
    });

```

> 需要确保id唯一，建议使用命名空间调用：
> const {onAction, callAction} = api.namespace('myname.')


在浏览器端的组件内，可通过调用`san-component`扩展的方法，在插件action方法调用的不同时期执行逻辑：

- `$onPluginActionCalled`：在action调用后执行
- `$onPluginActionResolved`：在action返回后执行
- `$callPluginAction`：在action调用时执行

例如：

```js
export default {
    created () {
        this.$onPluginActionCalled(action => {
            // 当 action 被调用时 且在运行之前
            console.log('called', action)
        });
        this.$onPluginActionResolved(action => {
            // 当 action 运行完毕之后
            console.log('resolved', action)
        });
    },

    methods: {
        testAction () {
            // 调用一个插件的 action
            this.$callPluginAction('com.my-name.test-action', {
                meow: 'meow'
            });
        }
    }
}
```


### 插件事件钩子

在ui.js的配置中，提供了项目不同阶段的时间钩子：

| api | 说明 | 例子 |
| --- | --- | --- |
| `onProjectOpen` | 当插件在当前项目中第一次被加载时触发 | `api.onProjectOpen((project, previousProject) => { // 重置数据 })` |
| `onPluginReload` | 当插件被重新加载时触发 | `api.onPluginReload((project) => { console.log('plugin reloaded') })` |

### 进程通讯ipc

IPC 就是进程间通信 (Inter-Process Communication) 的缩写。该系统允许你轻松的从子进程 (例如任务) 发送消息，并且轻量快速。在ui.js中使用`api.getIpc()`获取IPC的实例，进而实现进程的通讯，包含以下方法：

- `ipc.on(callback)`：添加listener监听
- `ipc.off(callback)`：移除listener监听
- `ipc.send(data)`：向连接的所有的IPC客户端发送消息


使用方式如下：

```js
   ipc.on(({data}) => {
        if (data.sanCliServe) {
            sharedData.set('serve-url', data.sanCliServe.url);
        }
    });
    ipc.off(({data}) => {
        ...
    });
    ipc.send(data);
```

### 数据共享

`San CLI UI`为开发者提供一种简易的、自定义组件之间通过共享的数据互通信息的方式。在ui.js中使用`const sharedData = api.getSharedData('my.com.')`获取sharedData的实例，为保证唯一使用，需要在使用数据函数时，输入唯一id生成自己的命名空间。包含以下方法：

- `sharedData.get($id)`：获取sharedData中$id的数据
- `sharedData.set($id, value, {disk})`：设置sharedData中$id的数据
- `sharedData.remove($id)`：清除sharedData中的$id的数据
- `sharedData.watch($id, handler)`：监听sharedData的$id的值变化
- `sharedData.unwatch($id, handler)`：清除sharedData的$id的监听

使用方法如下
```js

// 设置或更新
api.setSharedData('com.my-name.my-variable', data)

// 获取
const sharedData = api.getSharedData('com.my-name.my-variable')


// 移除
api.removeSharedData('com.my-name.my-variable')

// 侦听变化
const watcher = (value, id) => {
  console.log(value, id)
}
api.watchSharedData('com.my-name.my-variable', watcher)
// 取消侦听
api.unwatchSharedData('com.my-name.my-variable', watcher)

// 带命名空间的版本
const {
  setSharedData,
  getSharedData,
  removeSharedData,
  watchSharedData,
  unwatchSharedData
} = api.namespace('com.my-name.')

setSharedData('my-variable', data);
```

在浏览器端的组件内，可通过调用`san-component`扩展的方法，调用sharedData：

- `$getSharedData($id)`：获取sharedData中$id的数据
- `$watchSharedData($id, handler)`：监听sharedData的$id的值变化
- `$setSharedData($id, data)`：设置sharedData中$id的数据

例如：

```js

export default {

  async created () {
    const value = await this.$getSharedData('com.my-name.my-variable')

    this.$watchSharedData(`com.my-name.my-variable`, value => {
      console.log(value)
    })

    await this.$setSharedData('com.my-name.my-variable', 'new-value')
  }
}
```

## 3.持久存储db

`San CLI UI`为开发者提供对db操作的方法，数据存储的能力。在ui.js中通过调用`api.getDB(namespace)` 获取lowdb的实例对象，同样为隔离，需要输入唯一的命名空间。包含以下方法：

- `get(key)`：获取一个名为key的值
- `set(key, value)`：更新key的值为value

## 4.工具函数

- `api.hasPlugin('eslint')` 如果项目使用了该插件则返回 true
- `api.getCwd()`获取当前工作目录。
- `api.resolve(path)` 在当前工程下解析一个文件：
- `api.getProject()` 得到当前打开的工程。

## ClientAddon对象

在插件包内，ClientAddon实例化的对象ClientAddonApi主要完成两件事：

- 插件内对应组件的定义：`defineComponent`
- 将插件内的组件语言包扩展至`San CLI UI`：`addLocales`

在插件内的使用方式如下：

```js
import widgetdemo from './components/widget-demo';
import locales from './locales.json';

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    // 扩展语言
    ClientAddonApi.addLocales(locales);
    // 推荐以类型前缀定义组件的唯一id：'san.widget'
    ClientAddonApi.defineComponent('san.widget.components.widget-demo', widgetdemo);
}
```

通过`defineComponent`将自定义组件加载到`San CLI UI`内，此时组件内可使用san-component增强的功能，如santd组件、`$onPluginActionCalled`等方法；通过`addLocales`将自定义组件的语言包加载到`San CLI UI`内，此时组件内可直接使用`this.$t(key)`的形式显示页面文案；通过`ClientAddonApi.awaitComponent`方法，在组件加载到后，将组件挂载到页面对应位置。

