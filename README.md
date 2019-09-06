# Hulk cli - 前端研发命令集

## Hulk 3.0 roadmap

1. 基础 command
    1. build
    2. serve
    3. init
    7. Inspect
2. 插件化
    1. command
        1. 给现有 cmd 增加 flag
    2. webpack chain
    3. 日志流
    4. yargs
    5. babel、postcss 配置处理方式，跟 babelrc 和 postcss.config 冲突吗？
3. 事件流（生命周期）
4. hook 机制
5. UI
6. 支持 yarn+npm，默认 yarn

-   commander 换成 yargs
-   锁 webpack chain 版本

## Hulk 2.0

解决问题：

1. 发现大家在使用 Hulk-CLI 创建了项目之后，需要升级配置的时候，需要挨个升级，很是麻烦；
2. 而且之前的脚手架存在多处配置问题，需要重新设计下架构；
3. 纳入 lint 命令；
4. 扩展 hulk.config.js；
5. 增加 modern mode 打包；
6. 拆分 loader 和 plugin，修复设计不合理的地方，比如 markdown-loader 配置问题，不支持模板定制问题。

![](./roadmap-2.0.png)

## 开发

```bash
lerna bootstrap
```

## 发布

```bash
lerna publish --skip-git
```

## 测试

```bash
node packages/@baidu/hulk-cli/bin/hulk.js
```

## 二次编写

在 `packages/hulk-cli/commands/*` 添加命令，然后在`packages/hulk-cli/bin/hulk.js`添加入口，参考下面目录：

```
commands
├── init # 新增命令
│   ├── index.js # commander 配置
│   └── run.js   # action 实际代码
```

`index.js` 主要是 [commander](https://www.npmjs.com/package/commander) 配置

```js
// index.js 主要是 commander 配置，接收program配置
const run = require('./run');
module.exports = program => {
    program
        .command('update [path]')
        .description('执行npm outdated，升级目录下面的依赖')
        .allowUnknownOption()
        .action(run);
};
```

`run.js` 是项目实际的代码，接收`commander` `action`参数

> `run.js` 推荐用 import-lazy 来引入模块，尽量避免一开始就执行，不然会拖累 cli 的执行速度

## 远程部署

### config 配置

在 Hulk.config.js 中配置 deployMap 字段

```
 // receiver等字段参考fis的配置方式，示例如下

 deployMap: {
    ...
    sandbox: {
        receiver: 'http://fe.fis.searchbox.otp.baidu.com/fis/receiver',
        templatePath: '/home/work/orp',
        staticPath: '/home/work/orp/nginx.static/htdocs',
        staticDomain: 'http://yq01-wyneeyue.epc.baidu.com:8888'
    },
    ...
    anotherSandbox: {
        receiver: 'http://fe.fis.searchbox.otp.baidu.com/fis/receiver',
        templatePath: '/home/work/orp',
        staticPath: '/home/work/orp/nginx.static/htdocs',
        staticDomain: 'http://yq01-wyneeyue.epc.baidu.com:8888'
    },
    ...
 }

```

### 执行命令

在 build 命令中添加，`-r`(或`--remote`)参数，值为`deployMap`中的 key

```
hulk build --config hulk.config.js -r sandbox
```

这样就能把 build 的编译产物推送到远程机器了
