
# San CLI UI

`San CLI UI`是`San CLI`的图形化操作界面，实现`San CLI`工程项目的可视化管理；`San CLI UI`的功能定位是一款可视化的项目管理和构建的工具，在设计之初借鉴了业界比较优秀的可视化工具[Vue-CLI-UI](https://cli.vuejs.org/dev-guide/ui-api.html)和[JSUI](https://github.com/kitze/JSUI)的功能设计，以期更加适应用户的使用习惯，降低接入门槛，带来更好的使用体验，进而令工具更广泛地传播。

其次，`San CLI UI`附加了插件化设计，使得`San CLI UI`在功能增强的基础上更易于扩展，为更多功能集成提供了可能。随着插件建设的丰富，比如集成各种构建流程、小工具等，最终目标实现千人千面的个性化工作台，用户无需辗转各种网站工具，可以在`San CLI UI`处理一切工作相关的事情。

## 安装

作为`San CLI`的图形化界面，安装`san-cli@3`以上版本即可尽情享用。

!> 使用`San CLI UI`功能，请尽量保证 Node.js 版本 `>= 10.13.0`。

全局安装`San CLI`

```bash
# use npm 
> npm install -g san-cli

# or use yarn 
> yarn global add san-cli
```

## 使用

执行命令启动工作台

```bash
> san ui
```

在打开一个浏览器窗口体验`San CLI UI`的功能。

## 特点

基于`San CLI UI`的图形化和插件化，可以概括以下特点：

- 操作简单，新手友好
- 可视化操作
- 集成项目管理
- 自带配置语义
- 构建过程更直观
- 自定义工具集

