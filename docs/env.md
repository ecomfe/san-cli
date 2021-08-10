

# 环境变量

San CLI 会按照下面的优先级在**项目的根目录**中读取环境变量：

```
.env.${mode}.local
.env.${mode}
.env.local
.env
```

> mode 取值范围为`production`和`development`。

`.env`文件内的格式为每行一个键值对数据，举例如下：

```
ONE=1
SAN_VAR_TRUE=true
```

在`.env`的键值对 San CLI 会根据优先级进行合并，然后复制给`process.env`。例如上面赋值之后的结果是`process.env.ONE=1`。`.env`文件的读取是在加载`san.config.js`之前的，所以在`san.config.js`中可以直接使用`.env`文件设置的`process.env`变量。

**注意**：对于`NODE_ENV`和`BABEL_ENV`这两个 webpack 和 Babel 用到的环境变量，如果`.env`中不指定，则会根据`build`或者`serve`命令的`--mode`来指定。

环境变量除了上面的功能之外，还可以做一些其他的用法使用，比如在插件中可以使用`.env`中指定的环境变量，也可以在前端代码中使用环境变量的赋值。

## `build`命令中使用远程部署参数 `--remote`

在`san build`命令中，我们可以使用`--remote <remote-name>`的方式来将构建结果通过[deploy-files](https://github.com/jinzhan/deploy-files)插件上传到对应的开发机，方便进行测试和部署。而这里传入的`remote-name`实际是开发机的别名，比如小明的开发机就可以在`.env.production`中配置以`xiaoming`命名的相关的字段：

```bash
# .env.production
SAN_REMOTE_XIAOMING_RECEIVER=http://www.xiaoming.com:8080/receiver.php
SAN_REMOTE_XIAOMING_TEMPLATE_PATH=/home/work/nginx_static/html/test/template
SAN_REMOTE_XIAOMING_STATIC_PATH=/home/work/nginx_static/html/test/static
SAN_REMOTE_XIAOMING_STATIC_DOMAIN=http://test.bdstatic.com:8888
```

这样，当我们执行`san build --remote xiaoming`的时候会自动去寻找`.env.production`的 remote 配置，打包结束后会调用`deploy-files`上传数据到小明的开发机。

> 插件中使用环境变量，也可以按照这个思路来用，因为插件的调用也是在加载`.env`文件之后的。

## 前端代码中使用环境变量的赋值

在`.env`中定义的以`SAN_VAR_*`开头的变量会被[`DefinePlugin`](https://webpack.js.org/plugins/define-plugin/)作为变量直接解析成对应的值，即：

```bash
# .env 中环境变量设置为
SAN_VAR_HELLO=hello
```

则在代码中如果直接使用`console.log(HELLO)`，经过编译后就会变成`console.log('hello')`。

::: warning
1. `SAN_VAR_*`的定义不仅仅是在`.env`文件中，还可以在其他的打包之前的地方定义，比如在`san.config.js`中；
2. 在代码中可以继续使用类似`process.env.NODE_ENV`这类变量。
:::

## 常见应用场景举例

1. 某个常量的值，线下环境和线上环境不同，例如线下请求的数据接口是后端工程师的一个线下地址，那么可以使用环境变量定义这个常量；
2. 部署代码到自己的开发机，可以将环境变量写到`.env.local`中，并且将该文件添加到`.gitignore`中；
3. 任何需要在打包之前就计算好得到的变量，可以直接在`san.config.js`中直接赋值。
