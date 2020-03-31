/**
 * @file component-client-api.js
 * @author tanglei02 (tanglei02@baidu.com)
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
        }

    });
}

// function getTemplate(Ctor) {
//     return Ctor.template || Ctor.prototype.template;
// }

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

