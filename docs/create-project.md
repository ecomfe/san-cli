

# 初始化项目

## 没有安装 San-CLI 需要安装

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
> 2. 为了方便，我们创建了一个 San 的基础脚手架 ksky521/san-project，不指定脚手架创建时（即快速创建时），用的就是这个基础脚手架。

### 例如

```bash
# 1. 支持传入完整repo地址:
san init ksky521/san-project demo
# 下面的示例请换成自己的地址和 username
san init https://github.com/ksky521/san-project.git demo
# 下面的示例请换成自己的地址和 username (百度内部建议使用如下模板地址)
san init ssh://${username}@icode.baidu.com:8235/baidu/hulk/san-project-base demo
# 2. 默认是从 github repo 安装
# 所以 git@github.com:ksky521/simple.git 这个 repo到 demo 文件，可以使用：
san init simple demo
#  3. 支持 github，icode，gitlab 等简写方式
san init github:ksky521/san-project demo
san init icode:baidu/hulk/san-project-base demo
san init coding:ksky521/san-project demo
# 4. 分支写法
san init template#branch demo
# 5. 项目生成在当前目录
san init template#branch .
```

## `init` 参数说明

-   `--useCache，--cache` 优先使用本地已经下载过的脚手架缓存
-   `--install` 初始化成功后，进入目录安装依赖
-   `--offline` 标示 template 是离线脚手架
-   `--force` 跳过提醒，强制删除已存在的目录，默认会提醒
-   `--username，--u` 指定 Git 用户名，默认：git
-   `--registry` 设置 npm registry

## 使用 remote 管理脚手架模板别名

初始化的时候，项目脚手架路径较长，不容易记忆，可以使用 remote 命令来管理脚手架模板的别名。remote 方法包括三个：

-   add：添加
-   remove/rm：删除，
-   list/ls：列出脚手架模板 alias

#### 1. 添加一组 alias

```bash
# 基本语法
san remote add <name> <url>
```

###### **_例如_**

```bash
san remote add hello github:yyt/HelloWorld
san remote add project ssh://git@icode.baidu.com:8235/baidu/hulk/san-project-base
```

#### 2. 移除一组 alias

```bash
san remote remove <name>
```

从预设文件中将你输入的映射的关系移除

###### **_例如_**

```bash
san remote rm hello
```

#### 3. 查看 alias 列表

```bash
san remote list
```

查看目前的映射关系表

###### **例如**

```bash
san remote list
# or
san remote ls
```

更多类似用法和配置方式查看[预设文件](/presets.md)。
