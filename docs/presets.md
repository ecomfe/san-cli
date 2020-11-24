
# Presets 预设

为了方便个人和团队使用，San CLI 支持`sanrc.json`的预设文件，该文件存储在`homedir/.san/sanrc.json`，这个文件因为存储在个人的 home 文件夹，所以不会被同步到项目中，适应场景是自己定制的 San CLI 配置。

团队或者项目中如果要统一 San CLI 的预设配置，可以修改项目的`package.json`的`san`字段，添加对应的配置项。

> 更精确的表达是：sanrc.json 是 CLI 的配置文件，san.config.js 是项目的配置文件。

## 配置项

`sanrc.json`的文件配置项如下：

-   commands：**Array**，添加的 [Command 插件](/cmd-plugin.md)，数组内存储的是`String`类型，支持路径或者插件的 NPM 包名；
-   plugins：**Array**，添加的 [Service 插件](/srv-plugin.md)，数组内存储的是`String`类型，支持路径或者插件的 NPM 包名；
-   useBuiltInPlugin：**Boolean**，表示初始化 Service 时，是否使用内置插件，默认是`true`；
-   templateAlias：**Object**，脚手架模板的 alias Map，例如下面的配置，在使用`san init project target_path`时，会去对应的`icode`地址拉取脚手架模板。

```json
// sanrc.json 举例
{"templateAlias": {"project": "ssh://git@icode.baidu.com:8235/baidu/foo/bar"}}
```

配置在`package.json`的`san`字段举例：

```json
// 项目的 package.json
{
    "name": "san-project",
    // ..其他 package.json 配置
    // san 字段
    "san": {
        "commands": ["san-command.js"],
        "plugins": ["san-plugin.js"]
    }
}
```

## San CLI 中会修改`sanrc.json`的命令

San CLI 中有一些命令可以修改`sanrc.json`的配置。

### `san command add/remove/list`

`san command`是添加和管理 CLI Command 插件的命令：

-   add：添加
-   remove/rm：删除，
-   list/ls：列出 command 列表

**用法举例：**

```bash
san command add san-command.js
san command ls
san command rm san-command.js
san command add san-command.js -g
```

::: warning
1. `--global`,`-g`：默认写到项目的 package.json 的 san 字段，使用`-g`则写到 home 文件夹的`sanrc.json`文件。
2. command 实际是操作的`sanrc.json`或者 package.json `san` 的 commands 字段
:::

### san plugin add/remove/list

`san plugin`是添加和管理 CLI plugin 插件的命令：

-   add：添加
-   remove/rm：删除，
-   list/ls：列出 plugin 列表

**用法举例：**

```bash
san plugin add san-plugin.js
san plugin ls
san plugin rm san-plugin.js
san plugin add san-plugin.js -g
```

::: warning
1. `--global`,`-g`：默认写到项目的 package.json 的 san 字段，使用`-g`则写到 home 文件夹的`sanrc.json`文件。
2. plugin 实际是操作的`sanrc.json`或者 package.json `san` 的 plugins 字段
:::

### san remote add/remove/list

每次初始化项目的时候，都输出长长的脚手架地址，使用`san remote`可以给脚手架模板创建一个短别名：

-   add：添加
-   remove/rm：删除，
-   list/ls：列出脚手架模板 alias

**用法举例：**

```bash
# san remote add <name> <url>
san remote add project ssh://git@icode.baidu.com:8235/baidu/foo/bar
san remote ls
san remote rm project
```

::: warning
1. `remote`的命令不支持`--global`，操作的实际是`sanrc.json`的 `templateAlias` 字段。
2. 不建议在`package.json`中添加`templateAlias`。
:::
