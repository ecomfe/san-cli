/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 修改自 vue-cli,prompt 收集答案
 * @author ksky521
 */

const prompts = require('prompts');
const evaluate = require('./utils/evaluate');

const promptMapping = {
    string: 'text',
    boolean: 'confirm',
    // 因为把 inquirer 换成了 prompts，为了兼容旧脚手架模板，所以加了如下映射
    // list 是 inquirer 的单选问答，select 是 prompts 的单选问答
    // 虽然 prompts 也有名为 list 的问答，但是是个很不常用的问答，所以这么写没关系，等旧脚手架模板慢慢退出历史舞台后可以删了该映射
    list: 'select'
};

module.exports = async (prompts, data, argv) => {
    const answers = {};
    let keys = Object.keys(prompts);
    let key;
    while ((key = keys.shift())) {
        if (argv[key]) {
            // 这里是通过 cli 的 flag 传入的 key 值
            // 直接使用，不用再提问了
            answers[key] = argv[key];
        }
        else {
            await prompt(answers, key, prompts[key], data);
        }
    }
    return Promise.resolve(answers);
};
// 将 default 使用 templateData 渲染一下，比如作者之类的
// default中有{{author}}类似这样的，渲染一下，填上
function render(content, data) {
    if (content && /{{([^{}]+)}}/g.test(content)) {
        Object.keys(data).forEach(key => {
            if (data[key] && typeof data[key] === 'string') {
                content = content.split(new RegExp(`{{\\s*${key}\\s*}}`, 'g')).join(data[key]);
            }
        });
        return content;
    }

    return content;
}
async function prompt(data, key, prompt, tplData) {
    // 当 when 起作用的时候跳过
    if (prompt.when && !evaluate(prompt.when, data)) {
        // resolve();
        return;
    }

    /* eslint-disable space-before-function-paren,operator-linebreak */
    let promptDefault =
        typeof prompt.default === 'function'
            ? function() {
                return prompt.default.bind(this)(data);
            }
            : prompt.default;

    const answers = await prompts([
        {
            type: promptMapping[prompt.type] || prompt.type,
            name: key,
            message: prompt.message || prompt.label || key,
            initial: render(promptDefault, tplData),
            choices: prompt.choices || [],
            validate: prompt.validate || (() => true)
        }
    ]);

    // 如果回答是个数组，那么就是多选答案，给增加答案为key，相应结果为true
    if (Array.isArray(answers[key])) {
        data[key] = {};
        answers[key].forEach(multiChoiceAnswer => {
            data[key][multiChoiceAnswer] = true;
        });
        // 如果答案是串型，转义一下双引号
    }
    else if (typeof answers[key] === 'string') {
        data[key] = answers[key].replace(/"/g, '\\"');
    }
    else {
        // 其他类型的直接赋值
        data[key] = answers[key];
    }
}
