
# Command 插件

在日常开发中，我们可能需要扩展团队的 CLI 命令，比如给`san`命令添加一个`san deploy`命令，用于将代码上传到对应开发机上进行联调，这时候可以直接添加 San CLI 的 Command 插件来实现。

San CLI 的脚手架命令就是通过 Command 插件来实现的，详细代码可以参考[san-cli-command-init](TODO)对应的代码。

San CLI 的命令行解析是使用的[yargs](https://github.com/yargs/yargs/)实现的，Command 插件需要遵循 [yargs command module 规范](https://github.com/yargs/yargs/blob/master/docs/api.md#commandmodule)，即按照下面的写法：

```js
// 假设我们要给 san 添加一个 your_command_name
exports.command = 'your_command_name [your_option]';
// 这是命令的描述，or exports.desc
exports.describe = 'command description';
// 这是命令的别名，即 san alias_cmd === san your_command_name
exports.aliases = ['alias_cmd'];
// 这是命令的 flag 配置
exports.builder = {
    option1: {
        default: true,
        type: 'boolean'
    }
};
// builder 还支持函数写法，具体参见：
// 1. https://github.com/yargs/yargs/blob/master/docs/api.md#positionalkey-opt
// 2. https://github.com/yargs/yargs/blob/master/docs/api.md#commandmodule
// 执行命令的 handler，得到 yargs 解析后的 argv 对象
exports.handler = argv => {
    console.log(`setting ${argv.key} to ${argv.value}`);
};
```

## Command 插件配置

将 Command 插件扩展到自己的 San CLI 中有两种方式：预设文件和`package.json`两种方式。

::: warn 特殊说明
预设文件是放到电脑的 home 目录的，而且是全局的，所以个人配置的预设只是自己本人的，而不会影响到团队/项目；如果 Command 放到`package.json`，那么可以在这里执行 San CLI 命令，则会被执行。
:::

### 1. 预设文件

Command 插件可以通过配置[预设文件](./presets.md)`.sanrc`的`commands`字段，给 CLI 添加自定义 Command，这里添加的 Command 可以通过`san your_command_name [options]`方式使用。

### 2. package.json

Command 插件在`package.json`的配置也有两种方式：依赖和`san`配置。

1. 如果遵循`san-cli-command-xxx`的命名方式，并且把依赖（`dependencies`, `devDependencies`）添加到项目的`package.json`那么在该项目中执行对应的 Command 就可以被执行；
2. 在`package.json`中添加`san.commands`数组，添加自己的 Command 插件路径。

## Command 插件举例

下面以给 San CLI 扩展一个`hello`的命令为例，介绍下具体的代码用法和编写。

首先创建一个 js 文件，内容如下：

```js
// filename san-command.js
exports.command = 'hello';
exports.builder = {
    name: {
        type: 'string'
    }
};
exports.desc = 'San Command Plugin Demo';
exports.handler = argv => {
    console.log(`hello, ${argv.name}`);
};
```

然后在`package.json`中添加配置：

```json
// package.json
{
    "name": "demo",
    //下面是扩展配置
    "san": {
        "commands": ["san-command.js"]
    }
}
```

这时候执行`san hello --name demo`就可以看到对应结果。

> 在 San CLI 的项目代码中，san-cli-command-init 是 Command 插件，可以查看源码实现。
