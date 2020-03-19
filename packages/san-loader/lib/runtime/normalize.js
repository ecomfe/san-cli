/**
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
    /* eslint-disable no-var */
    var component;
    /* eslint-enable no-var */

    if (typeof script === 'object') {
        // script 中定义的 template 优先级最高
        if (template && !script.template) {
            script.template = template;
        }
        component = defineComponent(script);
    }
    else {
        if (template && !script.template && !script.prototype.template) {
            // 等价于 class A { static template = 'xxx' }
            // 可查看 static property 的 babel 编译产物
            script.template = template;
        }
        component = script;
    }

    return component;
}

