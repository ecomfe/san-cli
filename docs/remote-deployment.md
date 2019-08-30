## 远程部署

### config配置
在Hulk.config.js中配置deployMap字段

```
 // receiver等字段参考fis的配置方式，示例如下
 
 deployMap: {
    ...
    sandbox: {
        receiver: 'http://yq01-jiangyudong.epc.baidu.com:8080/receiver.php',
        host: 'http://yq01-jiangyudong.epc.baidu.com:8888',
        templatePath: '/home/work/orp',
        staticPath: '/home/work/orp/nginx.static/htdocs',
        staticDomain: 'http://yq01-wyneeyue.epc.baidu.com:8888'
    },
    ...
    anotherSandbox: {
        receiver: 'http://fe.fis.searchbox.otp.baidu.com/fis/receiver',
        host: 'http://fe.fis.searchbox.otp.baidu.com:8888',
        templatePath: '/home/work/orp',
        staticPath: '/home/work/orp/nginx.static/htdocs',
        staticDomain: 'http://yq01-wyneeyue.epc.baidu.com:8888'
    },
    ...
 }

```

> **说明**
> host配置项用于fsr部署（强烈推荐使用fsr的方式，符合公司安全规范），要求远程机器启动了fsr服务（详见：http://agroup.baidu.com/fis/md/article/196978 ）。
> 如果远程机器无法安装fsr，可以通过`disableFsr: 1`来禁用，这样就切换了到使用`receiver.php`这种不太安全的方式了。

### 执行命令

在build命令中添加，`-r`(或`--remote`)参数，值为`deployMap`中的key

``` 
hulk build --config hulk.config.js -r sandbox
```

这样就能把build的编译产物推送到远程机器了