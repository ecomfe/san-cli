# San Hot Module Replacement RoadMap

## 调研结果

一个完整的 HMR 功能的大体流程主要包含以下几个部分：

1. 监听源文件改动，触发 webpack 重新编译并 diff 出存在改动的模块；
2. webpack 通知 Client 端存在变化的文件 ID 以及新的文件内容；
3. Client 端根据不同的模块变化，执行模块的热替换或者是执行整体页面的刷新；

其中涉及到的模块包括：

1. webpack.HotModuleReplacementPlugin：热更新的基础，其他模块都是基于该插件所提供的 api 来实现热更新；
2. webpack-dev-server (内置 webpack-hot-middleware)：webpack 热更新功能的 Server 端中间件，实现对 webpack 重编译后得到的文件监听，并基于 Sock.js 通知 Client；
3. （style-loader、react-hot-loader、vue-loader（vue-hot-reload-api） 等等）client 端需要针对各个模块的作用，基于 HMR API 实现各自的模块热替换，包括旧模块移除、旧事件解绑、新模块注册等等。

在这些模块当中，1、2 的配置是通用的，只有 3 需要根据热更新模块进行针对性开发。这也是本次 San HMR 的工作重点。

基于 San 的项目一般包含以下模块：

1. 组件
    - 样式（css、less、sass、stylus）
    - 组件模板
    - 组件 Script
2. san-store
    - data
    - action

### 样式

在组件开发上，我们一般采用组件的样式单独开一个文件进行编写，然后在组件当中直接 `import` 的方式引入，在这种模式下，现有的 style-loader 已经能实现；

### 组件模板

目前 San 的组件模板，一般是以模板字符串的方式直接内联到 Script 当中，因此目前所能做的应该是将模板当成组件 Script 的一部分，统一走组件 Script 的热重载实现；后续如果考虑支持 san 单文件写法（类似 vue 单文件），则可以考虑直接触发对应组件的重渲染即可。

### 组件 Script

San 组件在开发的时候，可能会包含带有副作用的生命周期钩子，因此在 Script 发生变化的时候，应该直接将该组件的实例销毁并基于新代码进行创建。当组件存在全局副作用时，在 Vue-Loader 里面会对整个页面进行重载，因此 San 在实现对应的 HMR 功能时，应该也要实现类似的效果。

无论是 react-hot-loader 还是 vue-hot-reload-api，他们在实现 react 和 vue 的热加载功能时，都和对应框架的生命周期、私有变量之类深度整合，因此在开发 San 的 HMR 之前，同样需要花些力气去完全学习 San 的源码，去了解它的内部实现过程。

### san-store

Vuex 提供了 store.hotUpdate 方法来实现对 mutation\module\action\getter 的热更新；redux 则提供了 replaceReducer 的方法实现动态注入；目前 san-store 提供了 store.addAction 方法来注册行为，但是对于注册同名 action 的情况目前会直接报错，虽然目前还没有仔细阅读 san-store 源码，但倾向于认为目前 san-store 是不支持热更新的，因此在实现 san-store 模块的 HMR 之前，应该首先推动 san-store 实现类似的方法，或者是我们通过学习 san-store 源码之后，自行实现类似的方法在开发阶段注入到 san-store 当中。

## 功能拆分

根据目前调研的情况来看，San HMR 的功能的实现大概可以分为三期：

1. 一期：
    - 搭建基本的 HMR 前后端通信框架，即 San-CLI 整合 webpack-hot-middlerware 和 webpack.HotModuleReplacementPlugin；
    - 实现样式文件的 hmr；
    - 实现 JS 文件改动时刷新页面；
2. 二期：
    - 学习 vue-hot-reload-api 和 react-hot-loader 的基本实现方式；
    - 深度学习 san 源码;
    - 实现 san 组件的热更新；
        - 当组件仅存在模板改动时，直接重新渲染组件；
        - 当组件存在数据、生命周期钩子等其他变化时，则将旧组件销毁，并创建新的组件；
3. 三期
    - 学习 san-store 源码；
    - 实现类似于 store.hotUpdate 的方法；
    - San-CLI 增加对 san-store 文件的 hot-reload api 代码块注入





