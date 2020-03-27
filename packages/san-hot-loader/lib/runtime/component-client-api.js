/**
 * @file component-client-api.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

var utils = require('./utils');

var San;
var map = {};
var compatible;

global.__SAN_HOT_MAP__ = {};

function install(san) {
    if (compatible == null) {
        San = utils.esm(san);
        var versions = San.version.split('.');
        compatible = +versions[0] > 3 || +versions[1] > 5 || +versions[2] > 0;

    }

    if (!compatible) {
        throw new Error(
            '[HMR] You are using a version of san-hot-loader that is '
            + 'only compatible with san.js ^3.5.1'
        );
    }
}

function createRecord(id, ComponentClass) {
    var desc = makeComponentHot(id, ComponentClass);
    map[id] = {
        Ctor: desc.Ctor,
        options: desc.options,
        template: getTemplate(desc.Ctor),
        instances: []
    };
}

function injectHook(options, name, callback) {
    var existing = options[name];
    // 防止多次热更新之后出现套娃
    if (existing && existing['__san_hook_inject__']) {
        return;
    }

    options[name] = existing
        ? function () {
            existing.call(this);
            callback.call(this);
        }
        : callback;

    options[name]['__san_hook_inject__'] = true;
}

function makeComponentHot(id, ComponentClass) {
    ComponentClass = utils.esm(ComponentClass);

    var options;
    var Ctor;

    if (typeof ComponentClass === 'function') {
        options = ComponentClass.prototype;
        Ctor = ComponentClass;
    }
    else {
        options = ComponentClass;
        Ctor = San.defineComponent(options);
    }

    injectHook(options, 'attached', function () {
        map[id].instances.push(this);
    });
    injectHook(options, 'detached', function () {
        var instances = map[id].instances;
        instances.splice(instances.indexOf(this), 1);
    });

    return {
        options: options,
        Ctor: Ctor
    };
}

function hotReload(id, ComponentClass) {
    var newDesc = makeComponentHot(id, ComponentClass);
    var oldDesc = map[id];
    var newTemplate = getTemplate(newDesc.Ctor);
    var oldTemplate = oldDesc.template;

    oldDesc.template = newTemplate;

    var instances = oldDesc.instances;

    // 当只有 .san 的 template 更新的时候会出现这种情况，此时只需要替换 template 然后触发组件视图刷新就好了
    if (!isProtoChange(newDesc, oldDesc)) {
        // 当组件原型链不存在任何变化的情况下，不需要进行任何的视图更新
        if (newTemplate === oldTemplate) {
            return;
        }

        var aNode = getANode(newTemplate);
        oldDesc.options.aNode = aNode;
        for (var i = 0; i < instances.length; i++) {
            var instance = instances[i];
            // instance.parentComponent && instance.parentComponent._repaintChildren();
            instance._repaint();
        }
        return;
    }

    oldDesc.Ctor = newDesc.Ctor;
    oldDesc.options = newDesc.options;

    var parents = [];
    for (var i = 0; i < instances.length; i++) {
        var instance = instances[i];
        var parentComponent = instance.parentComponent;
        // 有一类组件的初始化属性是通过父组件向子组件传值的，这类组件在热更新的时候必须要通过父组件进行视图刷新才能够取到这些数值
        if (parentComponent) {
            // 可能会存在同一个组件不同名字的情况
            parentComponent.constructor.prototype.components[instance.subTag] = newDesc.Ctor;
            // 不同的组件可能存在同一 parent 因此需要做去重来减少改动
            if (parents.indexOf(parentComponent) === -1) {
                parents.push(parentComponent);
            }
        }
        // 没有 parent 的情况一般属于根组件，这类组件直接进行销毁和重新替换即可
        else {
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
            var newInstance = new newDesc.Ctor(options);
            newInstance.attach(parentEl, beforeEl);
        }
    }
    // 整体对父组件做视图重绘
    parents.forEach(function (parent) {
        parent._repaintChildren();
    });
}

function getANode(template) {
    // 不能直接用 San.compileComponent 产出 aNode，因为产出 aNode 之后还需要进行 preheatANode 操作，但这个方法并没有暴露出来，因此采用 defineComponent 来进行处理。
    var Ctor = San.defineComponent({
        template: template
    });
    var component = new Ctor();
    var aNode = component.constructor.prototype.aNode;
    return aNode;
}

function getTemplate(Ctor) {
    return Ctor.template || Ctor.prototype.template;
}

function isProtoChange(newDesc, oldDesc) {
    if (oldDesc.Ctor === newDesc.Ctor) {
        return false;
    }

    var oldProto = oldDesc.options;
    var newProto = newDesc.options;

    if (oldProto.constructor === newProto.constructor && oldProto.constructor != null) {
        return false;
    }
    // 根据 san.defineComponent 中所使用的 inherits 的定义，
    // Component 的原型链是通过 new Function()，再把 san 的描述对象
    // extend 到 new Function() 上，因此需要通过属性比较的方式判断描述对象是否改变
    var newKeys = Object.keys(newProto);

    for (var i = 0; i < newKeys.length; i++) {
        var key = newKeys[i];
        if (key === 'constructor' || key === 'template') {
            continue;
        }
        if (newProto[key] !== oldProto[key]) {
            return true;
        }
    }

    return false;
}

module.exports = {
    install: install,
    createRecord: createRecord,
    hotReload: hotReload,
    compatible: compatible
};

