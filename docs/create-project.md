---
title: 初始化项目
markdownIt:
    lineNumbers: false
---
# 初始化项目

## 没有安装 San-CLI 需要安装

```bash
npm i -g san-cli
```


## 快速创建

```bash
san init <template> <app-name>
```

1. 创建的为 san 项目
2. template 是工程项目脚手架地址，支持 github，icode，gitlab 等 repo 作为脚手架直接创建项目，并且可以指定 template 的 alias，详见下方**san remote**
3. app-name 是要创建的工程项目目录，可以为`.`（即在当前目录下创建）

###### ***例如***

```bash
# 1. 支持传入完整repo地址:
san init https://git.coding.net/yyt/HelloWorld.git demo
san init ssh://yanyiting@icode.baidu.com:8235/baidu/san/san-project-base demo
san init git@github.com:ksky521/nodeppt-template-default.git demo
# 2. 默认是从 github repo 安装
# 所以 git@github.com:ksky521/simple.git 这个 repo到 demo 文件，可以使用：
san init simple demo
#  3. 支持 github，icode，gitlab 等简写方式
san init github:yyt/HelloWorld demo
san init icode:baidu/baiduappfeed/itemrep demo
san init coding:yyt/HelloWorld demo
# 4. 分支写法
san init template#branch demo
# 5. 项目生成在当前目录
san init template#branch .
```

## 参数说明

`--useCache，--cache` 优先使用本地已经下载过的脚手架缓存

`--install` 初始化成功后，进入目录安装依赖

`--offline` 标示 template 是离线脚手架

`--force` 跳过提醒，强制删除已存在的目录，默认会提醒

`--username，--u` 指定 Git 用户名，默认：git

`--registry` 设置 npm registry

## san remote

可以指定 template 的 alias

#### 1. 添加一组 alias

```bash
san remote add <name> <url>
```

将你输入的映射的关系存入本地.sanrc 文件中

###### ***例如***

```bash
san remote add hello github:yyt/HelloWorld
```

#### 2. 移除一组 alias

```bash
san remote remove <name>
```

从本地.sanrc 文件中将你输入的映射的关系移除

###### ***例如***

```bash
san remote remove hello
```

#### 3. 查看 alias 列表

```bash
san remote list
```

###### ***例如***

```bash
san remote remove hello
```
