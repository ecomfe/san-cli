# 热重载的原理

## san-hot-reload-api

为了实现san.js的热重载，开发了一个`san-hot-reload-api`的库作为组件树的控制器。

当webapck在开发环境运行时，每一个san组件都会被`san-webpack-loader`注入一段热更新启用的代码：

```js
 if(module.hot){
        var hotApi = require('san-hot-reload-api')

        hotApi.install(require('san'), false)
        if(!hotApi.compatible){
            throw new Error('san-hot-reload-api is not compatible with the version of Vue you are using.')
        }
        module.hot.accept()
        var id = '${hotId}'

        if(!module.hot.data) {
            hotApi.createRecord(id, module.__proto__.exports.default)
        }else{
            hotApi.reload(id, module.__proto__.exports.default)
        }
    }
```

`san-hot-reload-api`主要完成了以下几件事：

1. 检测san的版本和兼容性
2. 当项目启动时，提前声明一个id，对每一个组件导出的Object进行快照记录
3. 当组件修改后，根据快照内容和修改后的内容进行merge并实现热更新


## createRecord


```js

exports.createRecord = function (id, options) {
    var Ctor = San.defineComponent(options);
    makeOptionsHot(id, options);
    map[id] = {
        Ctor: Ctor,
        options: options,
        instances: []
    };
};

function injectHook(options, name, hook) {
    var existing = options[name];

    options[name] = existing
        ? function () {
            existing.call(this);
            hook.call(this);
        }
        : hook;
}

function makeOptionsHot(id, options) {
    injectHook(options, 'attached', function () {
        map[id].instances.push(this);
    });

    injectHook(options, 'detached', function () {
        var instances = map[id].instances;
        instances.splice(instances.indexOf(this), 1);
    });
}
```

上述代码可以看出，`san-webpack-loader`会在组件的`attached`和`detached`两个生命周期中注入hook函数，以保证当组件代码有修改时，可以追踪到当前组件。


## reload


得益于构建后的模块导出的是一个Object对象，无论是注入钩子函数，还是完成热重载都变得超便利。

```js
exports.reload = tryWrap(function (id, newOptions) {
    var record = map[id];
    makeOptionsHot(id, newOptions);
    record.Ctor = San.defineComponent(newOptions);

    record.instances.concat().forEach(function (instance) {
        var parentEl = instance.el.parentElement;
        var beforeEl = instance.el.nextElementSibling;
        var options = {
            subTag: instance.subTag,
            owner: instance.owner,
            scope: instance.scope,
            parent: instance.parent,
            aNode: instance.givenANode
        };
        instance.dispose();
        var newInstance = new record.Ctor(options);
        newInstance.attach(parentEl, beforeEl);
    });
});
```

实现时，在热更新过程中一旦有异常抛出，webapck会立即刷新重启应用，这可能会导致开发者看不到控制台的异常调用栈，所以要使用tryCatch进行包裹。

当组件代码修改后，webpack热更新机制会将新的代码发送至浏览器端，我们只需根据原有组件实例的运行时信息传入新组件的构造器进行实例化，再插入到当前位置即可。

san的组件级别的热更新也让嵌套路由的实现成为可能。

