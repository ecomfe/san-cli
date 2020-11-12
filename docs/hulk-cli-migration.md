# hulk-cli升级san-cli

## 为什么要升级

San CLI 在架构设计上采取了微核心和插件化的设计思想，可以通过插件机制添加命令行命令，还可以通过插件机制定制 Webpack 构建工具，从而满足不同 San 环境的前端工程化需求。[了解更多](/architecture.md)

San CLI的可定制化，让我们和其他优秀开发者一起享受扩展插件、工具带来的开发体验和效率的提升。[了解更多](/plugin.md)

## 升级步骤

hulk-cli升级到san-cli非常方便，无需修改业务代码，只需要修改`package.json`和`配置文件`就能轻松完成升级。

### 1. 在项目目录安装san-cli依赖

Install with npm（当然也可以用yarn）:

```
npm install san-cli
```

然后，修改 package.json

1. 修改scripts命令：把原来的`hulk`修改为`san`;
2. 去掉hulk相关依赖：移除`@baidu/hulk-cli`和`@baidu/hulk-mock-server`;

### 2. 根据你的CSS预处理语言，在项目目录安装对应的loader

1. 如果使用`less`，执行

```
npm install less less-loader --save-dev
```

2. 如果使用`sass`，执行

```
npm install sass-loader sass --save-dev
```

3. 如果使用`stylus`，执行

```
npm install stylus stylus-loader --save-dev
```


### 3. 修改配置文件

把 `hulk.config.js` 重命名为 `san.config.js`；

#### 注意

`san-cli`默认是不编译node_modules里面的模块，如果你依赖包默认使用es6（如：`@baidu/nano`），需要把依赖包添加到`transpileDependencies`

```
module.exports = {
    ...
    
    transpileDependencies: ['@baidu/nano'],

    ....
}
```

### 4. (可选)新增postcss配置文件 .postcssrc.js

1. 为了使用`pr`单位，配置文件 `.postcssrc.js` 里要写入以下代码（需要安装`postcss-plugin-pr2rem`）：

```
// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
    "plugins": {
        "postcss-plugin-pr2rem": {
            // 视觉稿宽度为1242px
            rootValue: 124.2,
            unitPrecision: 5
        }
    }
};
```


2. 为了自动补全兼容不同厂商浏览器前缀，配置文件 `.postcssrc.js` 里还要加个`autoprefixer`（10版本如果有问题，换9版本试试），加完之后的 `.postcssrc.js` 如下：

```
// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
    "plugins": {
        "autoprefixer": {},
        "postcss-plugin-pr2rem": {
            // 视觉稿宽度为1242px
            rootValue: 124.2,
            unitPrecision: 5
        }
    }
};
```

3. 同时，和 `.postcssrc.js` 同级的目录要加多一个配置文件 `.browserslistrc`：


```
defaults
last 2 versions
iOS >= 9
android >= 5
```

更多参考：https://browserl.ist


### 5. 含smarty模板的项目

（如果你的项目中未使用到smarty模板，请忽略）


1. 安装并配置 `hulk-mock-server`

```
npm install hulk-mock-server --save-dev
```

修改 `san.config.js` 配置：


```
module.exports = {
    ...
    
     plugins: [{
        id: 'hulk-mock-server',
        apply(api) {
            // 这里使用接管了{output}/template 路径
            // 详细 hulk mock server 配置说明：https://www.npmjs.com/package/hulk-mock-server
            api.middleware(() => require('hulk-mock-server')({
                contentBase: path.join(__dirname, './' + outputDir + '/'),
                rootDir: path.join(__dirname, './mock'),
                processors: [`smarty?router=/template/*&baseDir=${path.join(__dirname, `./${outputDir}/template`)}&dataDir=${path.join(__dirname, './mock/_data_')}`] // eslint-disable-line
            }));
        }
    }],

    ....
}
```

