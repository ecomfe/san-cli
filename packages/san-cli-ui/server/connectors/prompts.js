/**
 * @file prompts
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/prompts.js
 */

let answers = {};
let prompts = [];

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
    console.log('Prompt answers', answers);
};

// Public API

const setAnswers = async newAnswers => {
    answers = newAnswers;
    await updatePrompts();
};


const reset = async (answers = {}) => {
    prompts = [];
    await setAnswers(answers);
};

const add = data => {
    const prompt = generatePrompt(data);
    prompts.push(prompt);
    return prompt;
};

const start = async () => {
    await updatePrompts();
};


module.exports = {
    setAnswers,
    reset,
    add,
    start
};
