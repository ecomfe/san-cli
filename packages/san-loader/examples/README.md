# San-Loader Webpack 配置实例 

这里是一个使用 San Loader 的示例项目，演示了如何在 webpack 中配置 san-loader，以及如何构建、如何在 HTML 中使用产出的 bundle。

## 开始使用

这个项目是开箱即用的，可以按下面步骤操作。进入当前目录后首先安装依赖：

```bash
npm install
```

调用 webpack 进行构建，将会产生 dist/bundle.js 和 dist/index.html：

```bash
npm run build
```

启动 HTTP 服务，访问提示的地址即可看到构建得到的 San 应用：

```bash
npm start
```

## 目录结构

```
examples
├── assets              # 静态资源
├── dist
│   ├── bundle.js       # 入口 JS 产出
│   └── index.html      # 入口 HTML 产出，引用了入口 JS 产出
├── index.html          # 入口 HTML 源码
├── package.json
├── src
│   ├── index.js        # 入口 JS 源码
│   ├── App.san         # 入口 San App
│   ├── components/     # San 组件
│   └── store/          # 一些 store
├── tsconfig.json       # 项目中 TS 源码的配置
└── webpack.config.js   # webpack 配置
```
