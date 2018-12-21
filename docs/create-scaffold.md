# 如何创建一个项目脚手架
无论是项目，还是组件初始化，任何想做成模板的项目/小代码片段都可以使用 `hulk init`来安装！

例如：比如大同小异的运营活动，一个项目的大量的组件，这些代码存在大量的重复代码和已经成型的最佳实践，这时候就可以按照本文内容来做成个hulk 的脚手架项目，供他人使用。

本文以`profile-component`[个人主页San组件脚手架](http://icode.baidu.com/repos/baidu/hulk/profile-component-template/tree/master)为例，来说明怎么创建一个项目脚手架。

## 目录结构

```
├── README.md
├── meta.js
└── template
```
hulk 脚手架的目录结构主要包含：

* readme 文件，项目的 readme 文件，介绍安装方法等
* meta.js/meta.json 安装时候需要回到的问题，问题内容可以作为参数变量将项目模板中的变量进行替换
* template 文件夹是实际项目生成后的文件

## meta.js/meta.json
`meta.js` 是模板创建 prompt 交互问题。可以支持`meta.json`或者`commandjs`的`meta.js`。

meta.js 包含三部分：

* prompt：提问交互性问题
* complete：项目初始化完成后的回调，和`completeMessage`任选一个
* completeMessage：完成后的信息，和`complete`任选一个

### prompt

本质上来说，meta 文件配置的问题，是使用交互式命令行工具[`nquirer.js`](https://github.com/SBoudrias/Inquirer.js/)来实现的，我们只需要按照`inquirer.js`的[问题文档](https://github.com/SBoudrias/Inquirer.js/#question)，来编写即可。例如`profile-component`的 prompt 内容如下：

```js
prompts: {
    name: {
        type: 'string',
        required: true,
        label: 'Component name',
        default: '{{name}}'
    },
    description: {
        type: 'string',
        required: true,
        label: 'Component description',
        default: 'San Component for Profile'
    },
    author: {
        type: 'string',
        label: 'Author',
        default: '{{author}}'
    }
}
```

即回答下面问题：

* Component name 是什么，默认是目录名称`{{name}}`
* Component description 是什么，默认是`San Component for Profile`
* Author 是什么，默认是当前电脑登录的用户名和 git 的账号邮箱


## 模板
回答的问题会组成一个对象，然后作为 data 传入模板，页面的中只要出现对应的值则会被替换。

### 模板替换
模板采用`Handlebars`语法，例如页面中下面代码：

```markdown
{{ name }}
----
{{author}}
```
回答的交互问题答案为：
```js
{
    name: 'test',
    author: 'wangyongqing01'
}
```

输出为：

```markdown
test
----
wangyongqing01
```

所有的文本类型文件（js/css/less/text/md....）都会被处理。

在举一个🌰：

```js
{
    "name": "{{name}}",
    "version": "1.0.0",
    "description": "{{ description }}",
}
```
output
```js
{
    "name": "test",
    "version": "1.0.0",
    "description": "San Component for Profile",
}
```
#### 模板就要输出`{{ xxx }}`怎么办？

使用转义符号：`\{{xxx}}` 即可！

### 模板中使用判断
同样，在模板中可以使用判断语句，hulk 模板中的判断语句写法示例如下：

```js
{{#if_eq mock "hulk"}}
import MockerServer from '@baidu/hulk-mock-server';
{{/if_eq}}
```

当`mock==='hulk'`的时候，则会输出`if_eq`中间的内容，否则不输出

## dot 文件
模板中的`_`开头的文件会被 hulk 处理成 dot 文件，即`_xxx`会变成`.xxx`，例如template/_babelrc经过hulk init之后，会变成.babelrc。**如果想本身就是个`_`开头的文件，那么请使用两个下划线`__`**

## 实例

* [个人主页San组件脚手架](http://icode.baidu.com/repos/baidu/hulk/profile-component-template/tree/master)
* [san project base](http://icode.baidu.com/repos/baidu/hulk/san-project-base)
