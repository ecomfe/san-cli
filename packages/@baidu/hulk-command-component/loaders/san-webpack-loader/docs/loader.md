# loader 的原理

## 想要把`.san`转换成什么样？
相比`san-loader`的黑箱模式，我们更希望可以把`.san`文件处理成纯净的js模块，就像下图这样：

![](http://ov35lvdq9.bkt.clouddn.com/15233436124975.jpg)

当`template`被当做导出模块的一个属性，`style`标签作为import进来的一个样式文件引入时，编译出的文件就是一个纯净的js模块了，他可以继续传递给不同的loader，以便webpack4在接收`content`时统一处理。

**这一步是在构建时，代码经过loader做的语法树级别的转换，并非`san-loader`中的拆分、运行时解析，这是两个loader最本质的区别。**

## 这一切是如何完成的？
![](http://ov35lvdq9.bkt.clouddn.com/15233445485380.jpg)

`san-webpack-loader`通过`posthtml`进行`.san`文件的html规范的抽象语法树解析，通过开发适合的插件完成代码转换，借助`webpack4`的模块处理能力生成纯净的js模块。

## import样式模块？
思考一个问题：

如何把`.san`文件中的样式import进最终构建出的js模块中，同时还可以保持`sourceMap`的追踪？






