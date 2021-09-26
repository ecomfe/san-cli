

# 初始化项目

## 没有安装 San CLI 需要安装

```bash
npm i -g san-cli
```

## 快速创建

```bash
san init <app-name>
```

> 1. 创建的是 san 项目。
> 2. app-name 是要创建的工程项目目录，可以为`.`（即在当前目录下创建）。

## 指定脚手架创建

```bash
san init <template> <app-name>
```

> 1. template 是工程项目脚手架地址，支持 github、icode、gitlab 等 repo 作为脚手架直接创建项目，并且可以指定 template 的 alias，详见下方的 **san remote**
> 2. 为了方便，我们创建了一个 San 的基础脚手架 wanwu/san-project，不指定脚手架创建时（即快速创建时），用的就是这个基础脚手架。

### 例如

```bash
# 1. 支持传入完整的 repo 地址:
san init wanwu/san-project#v4 demo
san init https://github.com/wanwu/san-project.git#v4 demo
# 2. 默认是从 github repo 安装
# 所以用 git@github.com:wanwu/simple.git 这个 repo 时可以简写成：
san init simple demo
# 3. 支持 github、icode、gitlab 等的简写方式
san init github:wanwu/san-project#v4 demo
san init icode:baidu/hulk/san-project-base demo
san init coding:wanwu/san-project demo
# 4. 分支写法
san init template#branch demo
# 5. 项目生成在当前目录
san init template#branch .
```

## `init` 参数说明

-   `--ssh`：下载脚手架模板时是否使用 SSH，默认使用 HTTP
-   `--useCache，--cache` 优先使用本地已经下载过的脚手架缓存，默认不使用
-   `--install` 初始化成功后，进入目录安装依赖
-   `--offline` 标示 template 是离线脚手架
-   `--force` 跳过提醒，强制删除已存在的目录，默认会提醒
-   `--username，--u` 指定 Git 用户名，默认：git
-   `--registry` 设置 npm registry
