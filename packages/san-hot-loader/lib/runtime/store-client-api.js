/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file store-client-api.js
 * @author clark-t
 */

var actionCache = {};
var storeCache = {};
var initDataCache = {};

function wrapStore(id, store) {
    if (actionCache[id]) {
        return;
    }
    actionCache[id] = {};
    // 这里的bind方法会报错，'bind' of undefined,暂时还没有想到很好的方法解决这个问题
    var originalAddAction = store.addAction.bind(store);
    store.addAction = function (name, callback) {
        if (store.actions[name] && !actionCache[id][name]) {
            store.actions[name] = null;
            actionCache[id][name] = true;
        }
        originalAddAction(name, callback);
    };
}

function updateStore(id, store) {
    if (!storeCache[id]) {
        wrapStore(id, store);
        storeCache[id] = store;
        initDataCache[id] = deepClone(store.raw);
        done(id);
        return;
    }

    if (storeCache[id] === store) {
        done(id);
        return;
    }

    var newData = store.raw;
    var newActions = store.actions;

    var savedStore = storeCache[id];
    var savedData = initDataCache[id];

    if (!equal(newData, savedData)) {
        throw Error('san-store initData changed');
    }

    var actionNames = Object.keys(newActions);
    for (var i = 0; i < actionNames.length; i++) {
        var name = actionNames[i];
        savedStore.addAction(name, newActions[name]);
    }

    done(id);
}

function done(id) {
    actionCache[id] = {};
}

function getProto(obj) {
    return Object.prototype.toString.call(obj);
}

function equal(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }

    if (Array.isArray(obj1)) {
        if (!Array.isArray(obj2)) {
            return false;
        }

        if (obj1.length !== obj2.length) {
            return false;
        }

        for (var i = 0; i < obj1.length; i++) {
            if (!equal(obj1[i], obj2[i])) {
                return false;
            }
        }

        return true;
    }

    var proto1 = getProto(obj1);
    var proto2 = getProto(obj2);

    if (proto1 !== proto2) {
        return false;
    }
    // 这里得考虑一下 对于 data 中存了 Set Map Date RegExp 这种类型的情况
    if (proto1 !== '[object Object]') {
        return false;
    }

    var keys1 = Object.keys(obj1);
    var keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (var j = 0; j < keys1.length; j++) {
        if (keys1[j] !== keys2[j]) {
            return false;
        }

        var key = keys1[j];
        if (!equal(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

function deepClone(obj) {
    if (Array.isArray(obj)) {
        var arr = [];
        for (var i = 0; i < obj.length; i++) {
            arr.push(deepClone(obj[i]));
        }
        return arr;
    }

    var proto = getProto(obj);
    // 只对 Object 做深拷贝
    if (proto !== '[object Object]') {
        return obj;
    }

    var clone = {};
    var keys = Object.keys(obj);
    for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        clone[key] = deepClone(obj[key]);
    }
    return clone;
}

module.exports = {
    update: updateStore
};

