

# 部署
在执行 `san build [entry] --remote <remote-name>` 时，使用的就是该页面的远程部署解决方案，支持从项目本地将生产环境编译产出直接远程部署到目标开发机。

使用时，需要进行相应的 **环境配置** 以及 **参数配置**，下面具体说明如何配置。

## 环境配置
### san工程

命令中 remote-name 对应着一组开发机配置项，通过 `.env.production` 文件 指定远端开发机的配置项，包括部署方式及路径等信息，env 文件说明参考[环境变量](./env.md)。

```bash
# 环境配置文件 .env.production
SAN_REMOTE_XIAOMING_DISABLE_FSR=true
SAN_REMOTE_XIAOMING_RECEIVER=http://www.xiaoming.com:8080/receiver.php
SAN_REMOTE_XIAOMING_TEMPLATE_PATH=/home/work/nginx_static/html/test/template
SAN_REMOTE_XIAOMING_STATIC_PATH=/home/work/nginx_static/html/test/static
SAN_REMOTE_XIAOMING_STATIC_DOMAIN=http://test.bdstatic.com:8888
SAN_REMOTE_XIAOMING_BASE_URL=http://www.cdnstatic.com
SAN_REMOTE_XIAOMING_HOST=http://www.xiaoming.com:8080

```

::: warning 上例解读
1. 命名规则：**SAN_REMOTE_（1.大写的 remote-name 名称）_ (2.大写的参数名称，驼峰处改用下划线分隔)**；其中【1】的与remote-name相同，【2】会解析为配置参数，具体含义见**参数配置**
2. 将 tpl、js、css 文件代码中 http://www.cdnstatic.com 替换成了 http://test.bdstatic.com:8888 。
:::

### 远端机器

远端机器需部署可接收文件的服务，有两种方式：

1. 通用方式：在远端机器，部署接收脚本（或者服务），这个是脚本的 [php](https://github.com/fex-team/fis3-deploy-http-push/blob/master/receiver.php) 实现版本（远端机器需要支持 php 的解析，如果需要其他语言实现，请参考这个 php 脚本实现），把脚本放到远端机器上某个 Web 服务根目录，配置一个 url 能访问到即可。
2. 百度内部：使用[fsr](http://agroup.baidu.com/fis/md/article/196978)方式进行部署。


## 参数配置

### 基础参数

#### `receiver`
远程服务的 receiver.php 地址，receiver.php 文件内容[参考](https://github.com/fex-team/fis3-deploy-http-push/blob/master/receiver.php)

#### `templatePath`
远程服务的模板存放地址，产出文件中的 .tpl 结尾的文件会上传到此路径下。

#### `staticPath`
远程服务的静态文件存放地址。

### 静态域名替换相关

#### `staticDomain`
静态文件服务域名。

#### `baseUrl`
需要被替换成远程静态文件服务域名的域名串

### fsr 相关（百度内部使用请参考[fsr](http://agroup.baidu.com/fis/md/article/196978?side=folder)）

#### `disableFsr`
是否禁用 fsr 安全部署服务，值为 true 或 false，默认是 false ，使用 fsr 安全部署服务（若远端机器使用脚本等方式接收，须禁用 fsr ，将此项置为 true ）

#### `host`
配置此项的前提是，disableFsr 为 false，启用了 fsr 安全部署服务，用于替换原来的 reciever 配置，拼接成该此项设置的域名。

###### 执行部署

```bash
# 单次构建并远程部署
san build --remote xiaoming
# 监听产出每次变动自动执行远程部署
san build --remote xiaoming --watch
```


## 简单说实现

使用[deploy-files](https://github.com/jinzhan/deploy-files)插件。

安装 deploy-files (版本 >= 0.1.1)：

```bash
npm i deploy-files
```

### 写法引入方式

webpack 插件的使用方式

引入：
```js
const DeployPlugin = require('deploy-files/webpack-plugin');
```

方式一：webpack 链式使用方式
```js
chainConfig.plugin('deploy-files').use(DeployPlugin, [remoteObj]);
```
方式二：webpack Config 中配置 plugins
```js
plugins: [
    ...,
    new DeployPlugin(remoteObj)
]
```

::: warning
remoteObj 即为上方部署中的相关配置参数。
:::
