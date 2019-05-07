# 项目脚手架

> 这是一个 San 的多页面脚手架产生的项目，适合多页面项目，支持 Smarty 和静态 HTML 做 layout 框架。
> PS：webapp 是分为框架页面和接口的，**layout 框架** 指 webapp 的承接框架的 HTML 页面，比如 Smarty 输出框架

---

## 项目脚手架快速创建项目

```bash
# 没有安装 hulk 需要安装
npm i -g @baidu/hulk-cli --registry http://registry.npm.baidu-int.com
hulk init project my-project-folder
```

**PS: hulk-cli node 版本需要>=8.9**

### hulk init 说明

1. `hulk init project my-project-folder` 是创建 san 项目，project 是 icode `hulk/san-project-base` 的 alias
2. 支持 github，icode，gitlab 等 repo 作为模板直接创建项目

**例如**

```bash
# 支持 vuejs-template github 增加github:
hulk init github:vuejs-templates/simple demo
# 默认是从 icode repo 安装
# 安装 baidu/hulk/simple 这个 repo到 demo 文件，可以使用：
hulk init simple demo
# 从 icode searchbox-fe/demo 这个 repo 作为项目模板，可以使用
hulk init searchbox-fe/demo demo
# 分支写法
hulk init name#branch demo
```

## 项目开发命令

项目开发和上线中使用 webpack 作为打包工具，直接使用 npm scripts 进行管理，主要操作如下：

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8001
npm start

# build for production with minification
npm run build

# analyzer
npm run analyzer
```

更多命令查看`package.json`的`scripts`字段。

### 编译相关配置和说明

#### `hulk.config.js`

hulk.config.js 是 hulk 的配置文件，配置格式[参考](./hulk-cli.md)

#### build.sh

打包脚本相关，上线配置 agile 命令请修改该文件，该文件保证执行后产生的是标准 orp 上线路径打包的 tar 包：

-   static-{name}.tar.gz
-   template.tar.gz

## 约定大于配置

-   统一端能力：为了方便适配手百版本和端能力 Mock，项目对端能力进行统一管理，统一放在`src/native`
-   统一接口请求：方便 node？可以在`webpack.resolve`中修改成对应的 node ral 版本，可以 mock。但是降低内聚性
-   统一管理业务逻辑：方便 Node 逻辑调用？但是降低内聚性

### 模板引擎

-   如果不使用 smarty，直接 html，则使用`pages.template.ejs`生成对应的页面 html，放到`output/_html`中，本地开发通过`localhost:port/_html`访问
-   使用 Smarty 模板，则通过`template`文件夹下面的 tpl 进行渲染，全部继承`base.tpl`模板，本地开发通过`localhost:port/template`访问

## 目录说明

```

├── mock
├── apim
├── src
│   ├── services       # 公共service请求
│   ├── assets         # 公共资源
│   │   └── font
│   ├── components     # 公共UI组件
│   │   └── demo
│   ├── layouts
│   ├── lib            # lib 库
│   │   ├── app.js
│   │   ├── fetch.js
│   │   └── utils
│   ├── native        # 端能力统一在这里管理
│   ├── pages          # 页面相关，后面详细讲解
│   │   └── demo
├── template
│   ├── base.tpl
│   └── demo
│       └── index.tpl
├── node_modules
├── public
├── output
├── docs
├── README.md
├── build.sh
├── package.json
├── pages.template.ejs
└── hulk.config.js
```

#### pages

```
pages
└── demo                # demo 页面
    ├── assets          # demo 页面用到的资源
    ├── components      # demo 页面用到的 UI 组件
    │   ├── comment
    │   └── publisher
    ├── index.js        # demo 入口文件
    ├── index.scss
    └── services        # demo 用到的接口请求 services
        └── index.js
```

### dotFile 配置

-   editorconfig：不需要修改，设置了 tab 4 个空格等，常见规范类的配置
-   npmrc：不需要修改，注册@baidu registry
-   prettierrc：不需要修改，格式化插件
-   gitignore：git 忽略
-   fecsrc：fecs 格式化配置
-   ezcoderc：同步开发机配置，yaml 格式，**暂不支持**
