# hulk-cli

手百前端CLI (Command Line Interface)

## 安装

```bash
npm i -g @baidu/hulk-cli --registry http://registry.npm.baidu-int.com
```
## 使用

```bash
# 查看帮助
hulk -h
# 初始化项目模板
hulk init <template-name> <project-name>
# 默认 san 项目模板
hulk init project <folder>
# 初始化组件模块
hulk init component <component-folder>
# 启动单页 dev server
hulk serve <san-or-js-file>
# 组件开发 dev server
hulk component docs/index.js
```

#### 例如

```bash
# 支持 vuejs-template github 增加github:
hulk init github:vuejs-templates/simple demo
# 默认是从 icode repo 安装
# 安装 baidu/hulk/simple 这个 repo到 demo 文件，可以使用：
hulk init simple demo
# 分支写法
hulk init name#branch demo
# 更多用法查看帮助
hulk --help
hulk <command> --help
```

安装模板后会自动安装依赖文件。

## `hulk.config.js`

## 默认**页面**模板
如果对 hulk 默认的 dev server 的 `index.html` 不能满足需求，可以在项目创建`public/index.html`来代替 hulk 内置的`index.html`，dev Server 会优先选择`public/index.html`作为页面模板。



