/**
 * @file 修改字 vue-cli,prompt 收集答案
 */
const inquirer = require('inquirer');

const promptMapping = {
    string: 'input',
    boolean: 'confirm'
};

module.exports = (prompts) => {
    const answers = {};
    let keys = Object.keys(prompts);

    return new Promise(async (resolve, reject) => {

        let key;
        while (key = keys.shift()) {
            await prompt(answers, key, prompts[key]);
        }
        resolve(answers);
    });
};

async function prompt(data, key, prompt, done) {
    // 当 when 起作用的时候跳过
    if (prompt.when && data[prompt.when]) {
        return done();
    }

    let promptDefault = prompt.default;
    if (typeof prompt.default === 'function') {
        promptDefault = function () {
            return prompt.default.bind(this)(data);
        };
    }

    const answers = await inquirer.prompt([{
        type: promptMapping[prompt.type] || prompt.type,
        name: key,
        message: prompt.message || prompt.label || key,
        default: promptDefault,
        choices: prompt.choices || [],
        validate: prompt.validate || (() => true)
    }]);

    if (Array.isArray(answers[key])) {
        data[key] = {};
        answers[key].forEach(multiChoiceAnswer => {
            data[key][multiChoiceAnswer] = true;
        });
    }
    else if (typeof answers[key] === 'string') {
        data[key] = answers[key].replace(/"/g, '\\"');
    }
    else {
        data[key] = answers[key];
    }
}
