# hulk-cli

手百前端CLI (Command Line Interface)

## 安装

```bash
npm i -g @baidu/hulk-cli
```
## 使用

```bash
hulk init <template-name> <project-name>
```

#### 例如

```bash
# 支持 vuejs-template github 增加github:
hulk init github:vuejs-templates/simple demo
# 默认是从 icode repo 安装
# 安装 baidu/searchbox-fe/simple 这个 repo到 demo 文件，可以使用：
hulk init simple demo
# 分支写法
hulk init name@branch demo
# 更多用法查看帮助
hulk --help
hulk <command> --help
```

安装模板后会自动安装依赖文件。

## 自制模板

自制模板项目可以放到 icode/github 上面供别人下载安装使用，模板由：`template`和`meta.json`两部分组成

### meta.json/meta.js
由以下四部分组成：

* `prompts`
* `filters`
* `completeMessage`
* `complete`

具体参考：https://github.com/vuejs/vue-cli/tree/v2#writing-custom-templates-from-scratch

**注意：没有支持 vue-cli 2.0的`Metalsmith`!**


### dot 文件处理
dot 文件例如：`.gitignore`等，在模板中命名为`_gitignore`，同理，如果本身是`_`开头的文件，请使用`__`来代替！

### 推荐模板目录结构为

```
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── _gitignore
├── _editorconfig
├── _babelrc
├── public
├── src
│   ├── App.vue
│   ├── assets
│   ├── components
│   └── main.js
├── webpack.config.base.js
├── webpack.config.dev.js
└── webpack.config.js
```

