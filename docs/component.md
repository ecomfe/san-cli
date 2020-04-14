
# San Component 组件开发

> 组件要求是不涉及具体业务的逻辑、粒度合理的单元。

组件分为项目公共组件、全局组件和页面级别组件三类。

-   公共组件：通过 npm 维护，项目使用`package.json`引入
-   全局组件：放到项目的`src/components/`，主要是全局性的，或通用性很强的组件，具备良好的封装性
-   页面级别组件：放在页面的`pages/*/components`下面维护，仅限本页面内使用

!> 公司内部更加详细的组件开发规范或者开发 Nano 组件，请参考 [Nano 组件库](http://hulk.baidu-int.com/docs/nano)规范！

## 组件开发

组件项目目录结构可以将自己团队的 Component 规范[创建一个脚手架](./create-scaffold.md)，然后使用 San CLI 的`init`命令在对应的组件路径中创建一个组件项目结构：

```bash
hulk init component-scaffold <folder-name>
```

例如我们的 Component 目录结构如下：

```
├── README.md          # 组件介绍
├── __tests__          # 测试相关
│   └── index.spec.js
├── docs               # 文档相关
│   ├── basic.md
│   └── index.js
├── index.js
├── package.json
└── style
    └── index.less
```

