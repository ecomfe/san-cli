/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file prompts数据验证组件
 * @author jinzhan
 */

/**
 * 当直接通过预设来传值的时候，需要保证预设是和prompts中相同的格式
 *
 * # 验证思路
 *  1. 遍历prompts中的全部字段；
 *  2. 检查必填字段的值是否存在，且符合预期，比如：list类型不能超出choices范围；
 *  3. 检查可选字段是否存在，可选字段的值是否OK；
 *  4. 检查隐藏的必填字段，比如list
 *  5. 注：多传了的字段不做关注；
 *
 * @param {Object} prompts prompts的问题，可以参考脚手架中的meta.js
 * @param {Object} presets 包含问题答案的JSON
 * @returns {boolean} 验证通过返回true
*/

module.exports = (prompts, presets) => {
    if (typeof presets !== 'object') {
        return false;
    }

    const keys = Object.keys(prompts);
    for (const key of keys) {
        const prompt = prompts[key];
        let isRequired = false;
        if (prompt.required) {
            isRequired = true;
        }
        else if (prompt.when) {
            isRequired = !!presets[prompt.when];
        }
        else if (prompt.type === 'list') {
            // 如果没有when，list也应该是必填的
            isRequired = true;
        }

        if (!isRequired) {
            continue;
        }

        const preset = presets[key];

        if (!preset) {
            // eslint-disable-next-line no-console
            console.log(`❗️ Project presets ${key} is not specified.`);
            return false;
        }

        // 对list类型进行检查，元素值不能超出list范围
        if (prompt.type === 'list') {
            const choices = prompt.choices.map(item => item.value);
            if (choices.indexOf(preset) === -1) {
                // eslint-disable-next-line no-console
                console.log(`❗️ Project presets ${key} is illegal.`);
                return false;
            }
        }
    }
    return true;
};