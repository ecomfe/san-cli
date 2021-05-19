# 如何创建一个脚手架项目

日常开发中，团队可以创建自己的项目脚手架，本文将介绍脚手架创建的方法。

## 脚手架项目必备的基础目录结构

```
├── template            # 模板目录结构
│   ├── san.config.js   # cli配置项
└── meta.js/meta.json   # 模板创建 prompt 交互问题
```

San CLI 使用 handlerbars 渲染 template 目录，所以脚手架请使用 handlerbars 语法。

## meta.js/meta.json

回答的内容会作为模板数据来处理文件

##### meta.js

```js
// meta 配置项
module.exports = {
    // 生成器会将 handlerbars 语法填上 prompts 内容
    // 扩展 handlerbars helper
    helpers: {},
    // 过滤满足 value 跳转的目录 key，不做生成处理
    filters: {
        'mock/**': 'useMock'
    },
    // 脚手架交互问答
    prompts: {
        name: {
            type: 'string',
            required: true,
            label: '项目名称',
            // 默认 {{name}} 会被替换成init 命令的目录名
            // 类似还有username、email 等 git 配置
            default: '{{name}}'
        },
        useMock: {
            type: 'confirm',
            message: '使用 mock 数据？'
        }
    },
    // San CLI 默认使用 yarn 安装依赖，若要使用 npm，则需把 useYarn 置为 false
    useYarn: false
};
```

##### meta.json

```json
{
    // meta 配置项
}
```

##### 配置项

`helpers` 自定义 handlerbars 的块级 helper，cli 会调用 registerHelper，处理这段自定义

**例如**

```js
// meta.js
{
    helpers: {
        if_or: (v1, v2, options) => {
            if (v1 || v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        };
    }
}
```

`filters` 过滤满足 value 跳转的目录 key，不做渲染处理

**例如**

```js
// meta.js
{
    filters: {
        'mock/**': 'tplEngine!=="smarty"',
        'template/**': 'tplEngine!=="smarty"',
        'template/demo-store/**': '!demo || (demo && demoType!=="store")',
        'template/demo/**': '!demo || (demo && demoType!=="normal")',
        'src/pages/demo-store/**': '!demo || (demo && demoType!=="store")',
        'src/pages/demo/**': '!demo || (demo && demoType!=="normal")'
    }
}
```

`prompts` 交互问答，key 为问题名称（string 类型），value 为问题配置项（Object 类型）

**例如**

```js
// meta.js
{
    prompts: {
        name: {
            type: 'string',
            required: true,
            label: '项目名称',
            default: '{{name}}'
        },
        tplEngine: {
            type: 'select',
            message: '选择模板引擎',
            choices: [
                {
                    title: 'Smarty（百度内部）',
                    value: 'smarty'
                },
                {
                    title: '纯 HTML',
                    value: 'html'
                }
            ]
        },
        demo: {
            type: 'confirm',
            message: '安装demo示例？'
        },
        demoType: {
            when: 'demo',
            type: 'select',
            message: '选择示例代码类型：',
            choices: [
                {
                    title: 'san-store (推荐)',
                    value: 'store'
                },
                {
                    title: 'normal',
                    value: 'normal'
                }
            ]
        }
    }
}
```

## san.config.js

san.config.js 是 San-CLI 的配置文件，配置格式[参考](/config.md)

## 相关 dot 文件

模板中的`_xxx`文件会在安装之后，转换成`.xxx`文件，例如`template/_babelrc`经过`san init`之后，会变成`.babelrc`。

常见 dot 文件：

-   babelrc：babel 配置
-   editorconfig：常见规范类的配置
-   npmrc：npm 配置
-   prettierrc：格式化插件
-   gitignore：git 忽略
-   fecsrc：fecs 格式化配置
