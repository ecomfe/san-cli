/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file component-client-api.js
 * @author clark-t
 */

var utils = require('./utils');

var San;
var map = {};
var compatible;

global.__SAN_HOT_MAP__ = map;

function install(san) {
    if (compatible == null) {
        San = utils.esm(san);
        var versions = San.version.split('.');
        compatible = +versions[0] > 3 || +versions[1] > 8 || +versions[2] > 0;

    }

    if (!compatible) {
        throw new Error(
            '[HMR] You are using a version of san-hot-loader that is '
            + 'only compatible with san.js ^3.8.1'
        );
    }
}

function createRecord(id, ComponentClass) {
    var desc = makeComponentHot(id, ComponentClass);
    map[id] = {
        Ctor: desc.Ctor,
        proto: desc.proto,
        instances: []
    };
}

var SAN_HOOK_ORIGIN = '__SAN_HOOK_ORIGIN__';

function injectHook(options, name, callback) {
    var existing = options[name];
    // 防止多次热更新之后出现套娃
    if (existing && existing[SAN_HOOK_ORIGIN]) {
        return;
    }

    options[name] = existing
        ? function () {
            existing.call(this);
            callback.call(this);
        }
        : callback;

    options[name][SAN_HOOK_ORIGIN] = true;
}

function makeComponentHot(id, ComponentClass) {
    ComponentClass = utils.esm(ComponentClass);

    var proto;
    var Ctor;

    if (typeof ComponentClass === 'function') {
        proto = ComponentClass.prototype;
        Ctor = ComponentClass;
    }
    else {
        proto = ComponentClass;
        Ctor = San.defineComponent(proto);
    }

    injectHook(proto, 'attached', function () {
        map[id].instances.push(this);
    });
    injectHook(proto, 'detached', function () {
        var instances = map[id].instances;
        instances.splice(instances.indexOf(this), 1);
    });

    return {
        proto: proto,
        Ctor: Ctor
    };
}

function hotReload(id, ComponentClass) {
    var newDesc = makeComponentHot(id, ComponentClass);
    var recDesc = map[id];

    var recANode;
    var recCmptReady;
    var newANode;
    var newCmptReady;

    // 热更新新旧组件构造函数相同的例子如下：
    // import template from './template.html'；
    // import ComponentClass from './app';
    // ComponentClass.template = template;
    // export default ComponentClass;
    //
    // 在单纯修改 template 的时候，热更新时新旧组件指向都是 ComponentClass 的地址，在这种情况下，需要采用特殊手段将 ComponentClass 的 template 和对应的 aNode 更新掉
    if (!isProtoChange(newDesc, recDesc)) {
        recANode = recDesc.proto.aNode;
        recCmptReady = recDesc.proto._cmptReady;
    }

    recDesc.Ctor = newDesc.Ctor;
    recDesc.proto = newDesc.proto;

    recDesc.instances.slice().forEach(function (instance) {
        var parentEl = instance.el.parentElement;
        var beforeEl = instance.el.nextElementSibling;
        var options = {
            subTag: instance.subTag,
            owner: instance.owner,
            scope: instance.scope,
            parent: instance.parent,
            source: instance.source
        };

        var newInstance;

        if (recANode != null) {
            recDesc.proto.aNode = recANode;
            recDesc.proto._cmptReady = recCmptReady;

            instance.dispose();

            if (newANode == null) {
                delete newDesc.proto.aNode;
                delete newDesc.proto._cmptReady;
            }
            else {
                newDesc.proto.aNode = newANode;
                newDesc.proto._cmptReady = newCmptReady;
            }

            newInstance = new newDesc.Ctor(options);
            newInstance.attach(parentEl, beforeEl);

            if (newANode == null) {
                newANode = newDesc.proto.aNode;
                newCmptReady = newDesc.proto._cmptReady;
            }
        }
        else {
            instance.dispose();
            newInstance = new newDesc.Ctor(options);
            newInstance.attach(parentEl, beforeEl);
            // 将父节点当中缓存的子组件实例给手动替换掉
            // 不然父组件往子组件里绑定的数据就不再变化了
            if (instance.parent) {
                instance.parentComponent.constructor.prototype.components[instance.subTag] = newDesc.Ctor;
                var parent = instance.parent;
                parent.children.splice(parent.children.indexOf(instance), 1, newInstance);
            }
        }

    });
}

function isProtoChange(newDesc, recDesc) {
    if (recDesc.Ctor === newDesc.Ctor) {
        return false;
    }

    var recProto = recDesc.proto;
    var newProto = newDesc.proto;

    if (recProto.constructor === newProto.constructor && recProto.constructor != null) {
        return false;
    }

    return true;
}

module.exports = {
    install: install,
    createRecord: createRecord,
    hotReload: hotReload,
    compatible: compatible
};

