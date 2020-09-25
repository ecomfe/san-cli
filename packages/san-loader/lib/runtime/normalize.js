/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file normalize.js
 * @author clark-t
 */

/* eslint-disable prefer-rest-params */

var defineComponent = require('san').defineComponent;

/**
 * 处理 .san 组件 script 与 template 等部分的组合方法
 *
 * @param {Object|Function} script 组件 script 部分
 * @param {string} template 组件 template 部分的文本
 * @param {string} injectStyles 组件需要注入的 style 列表
 * @return {Class} 组件类
 */
module.exports = function (script, template, injectStyles) {
    var dfns = componentDefinitions(script);
    for (var i = 0; i < dfns.length; i++) {
        if (template) {
            if (typeof template === 'string') {
                dfns[i].template = template;
            }
            else if (template instanceof Array) {
                dfns[i].aPack = template;
            }
            else {
                dfns[i].aNode = template;
            }
        }
        if (injectStyles.length) {
            injectStylesIntoInitData(dfns[i], injectStyles);
        }
    }

    return typeof script === 'object' ? defineComponent(script) : script;
};

function injectStylesIntoInitData(proto, injectStyles) {
    var style = {};
    for (var i = 0; i < injectStyles.length; i++) {
        objectAssign(style, injectStyles[i]);
    }
    var original = proto.initData;
    proto.initData = original
        ? function () {
            return objectAssign({}, original.call(this), {$style: style});
        }
        : function () {
            return style;
        };
}

function componentDefinitions(cmpt) {
    // 当 script 为 Function 时，等价于 class A { static template = 'xxx' }
    // 可查看 static property 的 babel 编译产物
    var dfns = [cmpt];
    // 对于联合 san-store 的情况，需要同时将 template, inited 等挂到原型链上
    if (typeof cmpt === 'function') {
        dfns.push(cmpt.prototype);
        if (cmpt.prototype.constructor) {
            dfns.push(cmpt.prototype.constructor.prototype);
        }
    }
    return dfns;
}

// 参考：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
function objectAssign(target) {
    'use strict';
    if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) {
            for (var nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}
