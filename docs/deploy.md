# 生产打包

`san deploy`是远程部署命令，与 `san build --remote` 相比，支持更复杂的远程目标配置，可通过 `san-cli` 集成也可通过安装 `san-deploy-cli` 独立使用。

## 使用命令

```bash
san deploy [target]
```

-   target：推送目标，具体传输路径由 `san.deploy.config.js` 指定。

### 配置相关

`san.deploy.config.js`的内容是一个 Node.js 的 CommandJS 格式，默认配置是：`

-   `--config -c` 指定配置文件，默认读取项目根目录下的 san.deploy.config.js
-   `--watch -w` 开启监听模式，默认不开启，仅推送一次

### 配置文件

以 `san deploy test` 命令为例，推送至 test指定的远程环境。san.deploy.config.js 文件内容如下：

```js
module.exports = {
    test: {
        root: 'output',
        disableFsr: false,
        ignore: [/(^|[\/\\])\../, '**/node_modules/**'],
        host: 'http://machine.com:8999',
        receiver: '',
        rule: [
            {
                match: '**', // glob
                to: '/path/to/dest',
            },
            {
                match: ['output/**', 'template/**'],
                to: '/path/to/dest'
            }
        ],
        replace: { // object or array
            from: new RegExp('http://static.com', 'ig'), // string/reg
            to: 'http://dev.com:8888/'
        }
    }
};
```

#### `root`
监听的根目录，可省略，默认 "."（当前目录）

#### `ignore`
忽略的文件，值为 `string` or `array`, 符合 [anymatch](https://www.npmjs.com/package/anymatch) 规范

#### `receiver`
远程服务的 receiver.php 地址，receiver.php 文件内容[参考](https://github.com/fex-team/fis3-deploy-http-push/blob/master/receiver.php)

#### `disableFsr`
是否禁用 fsr 安全部署服务，值为 true 或 false，默认是 false ，使用 fsr 安全部署服务。

若远端机器使用脚本等方式接收，须禁用 fsr ，将此项置为 true ）

#### `host`
配置此项的前提是，disableFsr 为 false，启用了 fsr 安全部署服务，用于替换原来的 reciever 配置，拼接成该此项设置的域名。

#### `rule`
部署规则，值为 `object` or `array`, 其中每一项内，指定了文件匹配规则 match, 部署到远端的 路径 to。
match 值为 string or array，支持 glob匹配文件 规则。

#### `replace`
替换规则，值为 `object` or `array`, 通常用于将静态文件 cdn 替换为测试环境静态服务地址。其中每一项需指定：原字符（from，支持正则及 string），替换的目标字符（to）

### 执行部署

```bash
# 单次构建并远程部署
san deploy test
# 监听产出每次变动自动执行远程部署
san build test --watch
```

> 实现依赖 [deploy-files](https://github.com/wanwu/deploy-files) 的 upload.js文件
> 一些不适于安装 san cli 的工程可使用 [san-deploy-cli](https://www.npmjs.com/package/san-deploy-cli) 完成推送。
