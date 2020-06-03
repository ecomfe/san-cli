/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file normalize.js
 * @author clark-t
 */

import {defineComponent} from 'san';

/**
 * 处理 .san 组件 script 与 template 等部分的组合方法
 *
 * @param {Object|Function} script 组件 script 部分
 * @param {string} template 组件 template 部分的文本
 * @param {string} injectStyles 组件需要注入的 style 列表
 * @return {Class} 组件类
 */
export default function (script, template, injectStyles) {
    for (const proto of componentDefinitions(script)) {
        if (template) {
            proto.template = template;
        }
        if (injectStyles.length) {
            injectStylesIntoInitData(proto, injectStyles);
        }
    }

    return (
        typeof script === 'object'
            ? defineComponent(script)
            : script
    );
}

function injectStylesIntoInitData(proto, injectStyles) {
    let style = {};
    for (let patch of injectStyles) {
        Object.assign(style, patch);
    }
    const original = proto.initData;
    proto.initData = original
        ? function () {
            return Object.assign({}, original.call(this), {'$style': style});
        }
        : function () {
            return style;
        };
}

function componentDefinitions(cmpt) {
    // 当 script 为 Function 时，等价于 class A { static template = 'xxx' }
    // 可查看 static property 的 babel 编译产物
    let dfns = [cmpt];
    // 对于联合 san-store 的情况，需要同时将 template, inited 等挂到原型链上
    if (typeof cmpt === 'function') {
        dfns.push(cmpt.prototype);
        if (cmpt.prototype.constructor) {
            dfns.push(cmpt.prototype.constructor.prototype);
        }
    }
    return dfns;
}
