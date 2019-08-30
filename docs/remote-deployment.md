## 远程部署

### config配置
在Hulk.config.js中配置deployMap字段

```
 // receiver等字段参考fis的配置方式，示例如下
 
 deployMap: {
    ...
    sandbox: {
        receiver: 'http://fe.fis.searchbox.otp.baidu.com/fis/receiver',
        templatePath: '/home/work/orp',
        staticPath: '/home/work/orp/nginx.static/htdocs',
        staticDomain: 'http://yq01-wyneeyue.epc.baidu.com:8888'
    },
    ...
    anotherSandbox: {
        receiver: 'http://fe.fis.searchbox.otp.baidu.com/fis/receiver',
        templatePath: '/home/work/orp',
        staticPath: '/home/work/orp/nginx.static/htdocs',
        staticDomain: 'http://yq01-wyneeyue.epc.baidu.com:8888'
    },
    ...
 }

```

### 执行命令

在build命令中添加，`-r`(或`--remote`)参数，值为`deployMap`中的key

``` 
hulk build --config hulk.config.js -r sandbox
```

这样就能把build的编译产物推送到远程机器了