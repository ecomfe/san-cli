/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file normalize.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

import {defineComponent} from 'san';

/**
 * 处理 .san 组件 script 与 template 等部分的组合方法
 *
 * @param {Object|Function} script 组件 script 部分
 * @param {string} template 组件 template 部分的文本
 * @return {Class} 组件类
 */
export default function (script, template) {
    if (template) {
        // 当 script 为 Function 时，等价于 class A { static template = 'xxx' }
        // 可查看 static property 的 babel 编译产物
        script.template = template;
        // 对于联合 san-store 的情况，需要同时将 template 挂到原型链上
        if (typeof script === 'function') {
            script.prototype.template = template;
            if (script.prototype.constructor) {
                script.prototype.constructor.prototype.template = template;
            }
        }
    }

    return (
        typeof script === 'object'
            ? defineComponent(script)
            : script
    );
}

