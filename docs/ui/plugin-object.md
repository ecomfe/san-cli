# PluginManager对象
PluginManager是整个cli ui插件系统的基础，该对象的方法按照功能可分为四类。
> 上文提到，在cli ui加载依赖时，会尝试读取依赖包内的ui.js文件，并将PluginManager对象的实例api注入其中，因此以下插件的使用均基于api来调用。

## 1. 插件定义类
此类模块主要包含cli ui中涉及到的各种类型插件的注册，集中管理各种插件。包括：addon插件、widget插件、配置插件、任务插件、自定义视图插件、路由插件。
### addon插件
addon插件是一个动态加载到cli ui中的JS包，用于加载各类自定义组件和路由。
通过`registerAddon`函数，开发者可以为自定义的插件指定id及加载路径（在npm包内的ui.js中），cli ui在插件加载时，会尝试从开发者指定的路径下加载插件定义，从而集成到cli ui对应位置，api使用方式如下：

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
#### API 说明
**registerAddon**

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 插件唯一id | string | 无 |
| url | 可选，开发模式下加载的url | string | 无 |
| path | npm包的路径 | string | 无 |

`registerAddon`是每个插件包的基础方法，此方法定义的插件被cli ui成功加载后，即可将以下方法定义的组件或配置应用的cli ui对应位置。

### widget插件
widget（部件）插件，指显示在「项目仪表盘」内的小部件，cli ui默认部件有：欢迎提示、运行任务、终止端口、新闻订阅。
通过`api.registerWidget`方法，开发者可实现自定义的部件，显示在仪表盘内。使用方式如下：

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

#### API 说明
**registerWidget**

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


### 配置插件
配置插件主要用于在项目配置tab中，增加用户自定义的配置项，将项目中配置文件修改变为可视化操作。目前san cli创建的工程，默认配置项包含san.config.js和eslint的配置。
通过调用`api.registerConfig`可以更改项目的配置，此函数返回一个符合inquirer.prompts格式的对象，通过该对象生成表单，可在项目配置中显示并修改具体项目的配置。使用方式如下：

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

#### 配置文件
其中files中可以声明多个配置文件，例如 .eslintrc 和 san.config.js，支持的类型有：json、yaml、js、package。配置时需要严格按照次顺序，如果这项配置不存在，则会创建列表中的第一个文件。例如:

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

#### API 说明
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

### 任务插件
在项目任务中展示的任务项，生成自项目 package.json 文件的 scripts 字段。
cli ui默认为`san serve`、`san build`、`san inspect`三个命令实现了增强效果。对应于start、build、analyzer、build:modern、inspect三个任务。
通过`api.registerTask` 方法，实现任务的“增强”，为任务增加额外的信息和显示，并能在对应的调用周期下实现附加功能。使用方式如下：

```js
    api.registerTask({
        // 匹配san serve 或者 测试地址：san-cli/index.js serve
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

### 自定义视图插件
开发者可以使用`api.registerView`创建自定义视图

### 路由插件
开发者可以使用`api.registerRoute`创建自定义路由页面

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

### 插件action
插件的action是cli ui的插件在浏览器端和Node.js之间的事件调用监听机制，例如终止端口插件的终止按钮，在按下后，会利用此api向node端传递需要杀死的端口，进而调用kill函数完成功能。
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
在浏览器端的组件内，可通过调用san.component扩展的`$onPluginActionCalled`、`$onPluginActionResolved`和`$callPluginAction`方法实现在action调用后、action返回后、action调用时，三个时期内需触发的功能

### 插件事件钩子
`onProjectOpen` 当插件在当前项目中第一次被加载时触发。
`onPluginReload` 当插件被重新加载时触发。

### 进程通讯ipc
IPC 就是进程间通信 (Inter-Process Communication) 的缩写。该系统允许你轻松的从子进程 (例如任务) 发送消息，并且轻量快速。
在cli ui中使用`api.getIpc()`获取ipc的实例，进而实现进程的通讯。例如

```js
   ipc.on(({data}) => {
        if (data.sanCliServe) {
            sharedData.set('serve-url', data.sanCliServe.url);
        }
    });
    ipc.off(({data}) => {
        ...
    });
    ipc.send(({data}) => {
        ...
    });
```

### 数据共享
cli ui为开发者提供一种简易的自定义组件之间通过共享的数据互通信息的方式。为保证唯一使用，需要在使用数据函数时，输入唯一id生成自己的命名空间

```js
// 带命名空间的版本
const sharedData = api.getSharedData('my.com.');

// 获取sharedData中$id的数据
sharedData.get($id)
// 设置sharedData中$id的数据
sharedData.set($id, value, {disk})
// 清除sharedData中的$id的数据
sharedData.remove($id)
// 监听sharedData的$id的值变化
sharedData.watch($id, handler)
// 清除sharedData的$id的监听
sharedData.unwatch($id, handler)

```

## 3.持久存储db
`api.getDB(namespace)` 获取lowdb的实例对象

## 4.工具函数
`api.hasPlugin` 如果项目使用了该插件则返回 true
`api.getCwd`获取当前工作目录。
`api.resolve` 在当前工程下解析一个文件：
`api.getProject` 得到当前打开的工程。


# ClientAddon对象
`defineComponent`定义组件对象
`addLocales`扩展语言包

