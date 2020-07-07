/**
 * @file prompts
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/prompts.js
 */
const {get, set, unset} = require('../utils/object');
let answers = {};
let prompts = [];

const generatePromptError = value => {
    let message;
    if (typeof value === 'string') {
        message = value;
    }
    else {
        message = 'Invalid input';
    }
    return {
        message
    };
};
const getDefaultValue = async prompt => {
    let defaultValue = prompt.raw.default;
    if (typeof defaultValue === 'function') {
        defaultValue = await defaultValue(answers);
    }

    if (prompt.type === 'checkbox') {
        const choices = prompt.raw.choices;
        if (choices) {
            return choices.filter(
                c => c.checked
            ).map(
                c => c.value
            );
        }
    }
    else if (prompt.type === 'confirm') {
        if (prompt.raw.checked) {
            return true;
        }
        return defaultValue || false;
    }
    return defaultValue;
};

const getEnabled = async value => {
    const type = typeof value;
    if (type === 'function') {
        const result = await value(answers);
        return !!result;
    }
    if (type === 'boolean') {
        return value;
    }
    return true;
};

const validateInput = (prompt, value) => {
    const validate = prompt.raw.validate;
    if (typeof validate === 'function') {
        return validate(value, answers);
    }
    return true;
};

const getFilteredValue = (prompt, value) => {
    const filter = prompt.raw.filter;
    if (typeof filter === 'function') {
        return filter(value);
    }
    return value;
};

const getTransformedValue = (prompt, value) => {
    const transformer = prompt.raw.transformer;
    if (typeof transformer === 'function') {
        return transformer(value, answers);
    }
    return value;
};

const generatePromptChoice = (prompt, data, defaultValue) => {
    return {
        value: JSON.stringify(getTransformedValue(prompt, data.value)),
        name: data.name,
        checked: data.checked,
        disabled: data.disabled,
        isDefault: data.value === defaultValue
    };
};

const getChoices = async prompt => {
    const data = prompt.raw.choices;
    if (!data) {
        return null;
    }

    let result;
    if (typeof data === 'function') {
        result = await data(answers);
    }
    else {
        result = data;
    }
    let defaultValue;
    if (prompt.type === 'list' || prompt.type === 'rawlist') {
        defaultValue = await getDefaultValue(prompt);
    }
    return result.map(
        item => generatePromptChoice(prompt, item, defaultValue)
    );
};
const setAnswer = (id, value) => {
    set(answers, id, value);
};

const removeAnswer = id => {
    unset(answers, id);
};

const getAnswer = id => {
    return get(answers, id);
};
const generatePrompt = data => {
    return {
        id: data.name,
        type: data.type,
        visible: true,
        enabled: true,
        name: data.name || null,
        message: data.message,
        group: data.group || null,
        description: data.description || null,
        link: data.link || null,
        choices: null,
        value: null,
        valueChanged: false,
        error: null,
        tabId: data.tabId || null,
        raw: data
    };
};

const updatePrompts = async () => {
    for (const prompt of prompts) {
        const oldVisible = prompt.visible;
        prompt.visible = await getEnabled(prompt.raw.when);

        prompt.choices = await getChoices(prompt);

        if (oldVisible !== prompt.visible && !prompt.visible) {
            removeAnswer(prompt.id);
            prompt.valueChanged = false;
        }
        else if (prompt.visible && !prompt.valueChanged) {
            let value;
            const answer = getAnswer(prompt.id);
            if (typeof answer !== 'undefined') {
                value = await getTransformedValue(prompt, answer);
            }
            else if (typeof prompt.raw.value !== 'undefined') {
                value = prompt.raw.value;
            }
            else {
                value = await getDefaultValue(prompt);
            }
            prompt.rawValue = value;
            prompt.value = JSON.stringify(value);
            const finalValue = await getFilteredValue(prompt, value);
            setAnswer(prompt.id, finalValue);
        }
    }

    console.log('Prompt answers', answers);
};
const setAnswers = async newAnswers => {
    answers = newAnswers;
    await updatePrompts();
};

const reset = async (answers = {}) => {
    prompts = [];
    await setAnswers(answers);
};

const list = () => {
    return prompts;
};

const add = data => {
    const prompt = generatePrompt(data);
    prompts.push(prompt);
    return prompt;
};

const start = async () => {
    await updatePrompts();
};

const findOne = id => (
    prompts.find(p => p.id === id)
);

const setValue = async ({id, value}) => {
    const prompt = findOne(id);
    if (!prompt) {
        console.warn(`Prompt '${prompt}' not found`);
        return null;
    }

    const validation = await validateInput(prompt, value);
    if (validation !== true) {
        prompt.error = generatePromptError(validation);
    }
    else {
        prompt.error = null;
    }
    prompt.rawValue = value;
    const finalValue = await getFilteredValue(prompt, value);
    prompt.value = JSON.stringify(value);
    prompt.valueChanged = true;
    setAnswer(prompt.id, finalValue);
    await updatePrompts();
    return prompt;
};

const answerPrompt = async ({id, value}, context) => {
    await setValue({id, value: JSON.parse(value)});
    return list();
};
module.exports = {
    setAnswers,
    //   changeAnswers,
    //   getAnswers,
    //   getAnswer,
    reset,
    //   list,
    add,
    //   remove,
    start,
    //   setValue,
    //   findOne,
    getDefaultValue,
    answerPrompt
};