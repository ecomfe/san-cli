
# addon组件

## addon组件的定义

**addon组件**：是一个动态加载到cli-ui的js包，其结构满足CLI插件的默认包结构。项目的仪表盘内显示的部件widget、任务内的显示视图view等，都称为addon，均以单独的npm包形式存在。

外部addon的，主要借助两个api实现在cli ui内的显示：
1. `api.registerAddon`：注册一个addon，定义加载的addon id及路径。
2. `api.registerWidget`/`api.registerTask`：注册一个widget组件/view组件，用于将自定义组件加载到dashboard/task视图内。

## addon挂载的基本步骤

-   创建：创建一个addon的项目，可以为单独的npm包或者在已有的插件内增加
-   实现：编写index.js实现自定义组件，通过cli ui提供的`ClientAddonApi`将组件定义挂载到全局
-   注册：在ui.js文件中调用`api.addClientAddon`指定构建后的js包加载路径
-   显示：在ui.js文件中调用指定api挂载到指定视图内，例如api.registerWidget注册组件到dashboard

在开发addon组件过程中，会涉及到以下api：
- `api.registerAddon`：addon组件注册
- `api.registerWidget`：widget部件注册
- `api.callAction`：事件调用
- `api.onAction`：事件监听
- `ClientAddonApi.defineComponent`：组件定义
- `ClientAddonApi.addLocales`：组件扩展语言

接下来以实际例子来展示插件的开发过程。
## Dashboard接入自定义部件widget


cli ui提供了将自定义组件挂载到项目仪表盘的方式，通过此功能，你可以定制属于自己的个性仪表盘，也可将小工具分享给更多的人使用。

接下来以一个逐步讲解一个新增自定义widget部件的过程，这里以图片压缩小部件`san-cli-ui-widget-tiny-image`为例，点击下文的链接可随时点击查看源码。

### 1. 创建一个addon组件的工程

推荐使用san cli创建一个新的项目，作为开发依赖安装san-cli-ui，在san.config.js中填写如下内容（[demo参考](https://github.com/amazing-js/san-cli-ui-widget-tiny-image/blob/master/san.config.js)）：

```js
const clientAddonConfig = require('san-cli-ui/client-addon-config');

module.exports = {
    ...clientAddonConfig({
        id: 'san.webpack.client-addon.widget.tiny-image', // 名称唯一
        port: 8891 // 端口可变
    })
};
```

> 注意：id应设置正确的命名，且在所有插件中保持唯一

通过`clientAddonConfig`可生成san.config.js的默认配置，打包出的代码输出到`./dist/index.js`。

demo目录结构如下：

```js
san-cli-ui-widget-tiny-image
├── README.md
├── src
      ├──components
│     └── index.js
├── package.json
├── san.config.js
└── ui.js         // San UI 集成（这里存放插件的配置信息）
```

在开发环境下可以运行`npm run serve`，发布时运行`npm run build`。

### 2. 实现

实现自定义组件，在src/index.js中，通过cli ui提供的ClientAddonApi将组件定义挂载到全局，打开文件中的[`src/index.js`](https://github.com/amazing-js/san-cli-ui-widget-tiny-image/blob/master/src/index.js)

```js
import TinyImage from './components/tiny-image';
import locales from './locales.json';

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    // 扩展语言文案
    ClientAddonApi.addLocales(locales);
    // 注册一个自定义组件
    ClientAddonApi.defineComponent('san.widgets.components.tiny-image', TinyImage);
}
```

> 注意：ClientAddonApi.defineComponent注册的id值在所有插件中唯一

### 3. 注册

在[`ui.js`](https://github.com/amazing-js/san-cli-ui-widget-tiny-image/blob/master/ui.js)中，使用 `api.addClientAddon` 方法并指定构建后加载的id和路径：

```js

module.exports = api => {
    if (process.env.SAN_CLI_UI_DEV) { // 自定义的环境变量，在开发环境下
        api.registerAddon({
            id: 'san.widgets.client-addon.dev1',
            url: 'http://localhost:8891/index.js'
        });
    }
    else {
        api.registerAddon({
            id: 'san.widgets.tiny-image.client-addon',
            path: 'san-cli-ui-widget-tiny-image'
        });
    }
}
```

可以在开发环境指定id和url，在正式环境指定npm包内的构建后的dist路径

> 注意：此处开发环境的url端口应与第一步中san.config.js的port端口相同

### 4. 显示

加载路径配置完毕，可以继续配置自定义的部件在显示位置，在[ui.js](https://github.com/amazing-js/san-cli-ui-widget-tiny-image/blob/master/ui.js)中，通过调用`api.registerWidget`来定义显示到dashboard的组件

```js
	 // tiny-image
    api.registerWidget({
        id: 'san.widgets.tiny-image',
        title: 'san-cli-ui-widget-tiny-image.title',
        description: 'san-cli-ui-widget-tiny-image.description',
        icon: 'file-image',
        component: 'san.widgets.components.tiny-image',
        minWidth: 2,
        minHeight: 2,
        maxWidth: 2,
        maxHeight: 2,
        maxCount: 1,
        // 增加压缩选项配置
        defaultConfig: () => ({
            quality: 0.8
        }),
        async onConfigOpen() {
            return {
                prompts: [
                    {
                        name: 'quality',
                        type: 'input',
                        message: 'san-cli-ui-widget-tiny-image.prompts.quality',
                        validate: input => !!input
                    }
                ]
            };
        }
    });
```

还可使用`api.onAction`用于监听组件内的事件，组件内的调用方式，例如（具体说明见[文档](https://ecomfe.github.io/san-cli/#/ui/start)）：

```js
const {results, errors} = await this.$callPluginAction('san.widgets.actions.fetch-news', {
    url: this.data.get('widget.config.url'),
    force
});
```

以上就是一个 addon 代码，注册了 `san.widgets.tiny-image` 组件



### 5. 在项目中加载及调试

**原理**：在每个安装好的 san-cli 插件里，cli-ui 都会尝试从其插件的根目录加载一个可选的 `ui.js` 文件。
在插件的tab下安装的npm包，会将插件安装到具体项目的依赖中，plugin初始化查找时，会遍历package.json中的dependencies和devDependencies，找到插件后会读取`ui.js`进而加载新的插件。

1. 插件包中执行`npm run start`启动插件本地服务
2. 由于已经安装的san-cli-ui是生产环境，因此需要对插件的ui.js进行修改：

    ```js
    module.exports = api => {
        // 直接加载本地调试端口地址，调试完成后再恢复
        api.registerAddon({
            id: 'san.widgets.client-addon.dev1',
            url: 'http://localhost:8891/index.js'
        });
    }
    ```
3. 使得san-li可以加载到插件的ui.js配置，有两种方案选择其一即可：
    - 通过san cli依赖读取：在cli打开的san项目对应的package.json的依赖中手动加入新包的名字，在项目的node_modules下增加新包文件夹，只需包含刚才修改的 `ui.js` 文件即可，目的是确保CLI在读取依赖时，可以读取到新增组件的配置，之后重启项目
    - 通过san cli ui读取默认插件配置：在san-cli依赖的包中找到san-cli-ui目录，修改`/xxx/san-cli/node_modules/san-cli-ui/plugins/index.js`，此文件为san cli ui的内置插件，增加待调试的插件配置项：

        ```js
        module.exports = api => {
            ...
            require('/xxx/san-cli-plugin-tools/ui')(api); // 引入新的npm包配置
        };
        ```
    以上任选一种只需确保cli ui可以读取到新包的ui配置即可

调试完毕后，恢复`ui.js` 的配置，执行`npm run build` + `npm publish`完成包的发布。
在`san ui`的插件管理中搜索并安装插件即可。