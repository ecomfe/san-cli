/**
 * @file prompts connectors
 * @author zttonly
 */
const {get, set, unset} = require('lodash');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const debug = getDebugLogger('ui:prompts');

class Prompts {
    constructor() {
        this.answers = {};
        this.prompts = [];
    }
    generatePromptError(value) {
        const message = typeof value === 'string' ? value : 'Invalid input';
        return {
            message
        };
    }
    async getDefaultValue(prompt) {
        let defaultValue = prompt.raw.default;
        if (typeof defaultValue === 'function') {
            defaultValue = await defaultValue(this.answers);
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
    }
    async getEnabled(value) {
        const type = typeof value;
        if (type === 'function') {
            const result = await value(this.answers);
            return !!result;
        }
        if (type === 'boolean') {
            return value;
        }
        return true;
    }
    validateInput(prompt, value) {
        const validate = prompt.raw.validate;
        if (typeof validate === 'function') {
            return validate(value, this.answers);
        }
        return true;
    }
    getFilteredValue(prompt, value) {
        const filter = prompt.raw.filter;
        if (typeof filter === 'function') {
            return filter(value);
        }
        return value;
    }
    getTransformedValue(prompt, value) {
        const transformer = prompt.raw.transformer;
        if (typeof transformer === 'function') {
            return transformer(value, this.answers);
        }
        return value;
    }
    generatePromptChoice(prompt, data, defaultValue) {
        return {
            value: JSON.stringify(this.getTransformedValue(prompt, data.value)),
            name: data.name,
            checked: data.checked,
            disabled: data.disabled,
            isDefault: data.value === defaultValue
        };
    }
    async getChoices(prompt) {
        const data = prompt.raw.choices;
        if (!data) {
            return null;
        }

        let result;
        if (typeof data === 'function') {
            result = await data(this.answers);
        }
        else {
            result = data;
        }
        let defaultValue;
        if (prompt.type === 'list' || prompt.type === 'rawlist') {
            defaultValue = await this.getDefaultValue(prompt);
        }
        return result.map(
            item => this.generatePromptChoice(prompt, item, defaultValue)
        );
    }
    setAnswer(id, value) {
        set(this.answers, id, value);
    }
    removeAnswer(id) {
        unset(this.answers, id);
    }
    getAnswer(id) {
        return get(this.answers, id);
    }
    generatePrompt(data) {
        return {
            id: data.name,
            type: data.type,
            visible: true,
            enabled: true,
            name: data.name || null,
            message: data.message,
            placeholder: data.placeholder || null,
            group: data.group || null,
            description: data.description || null,
            link: data.link || null,
            choices: null,
            value: null,
            valueChanged: false,
            error: null,
            tabId: data.tabId || null,
            formItemLayout: data.formItemLayout || {},
            raw: data
        };
    }
    async updatePrompts() {
        for (const prompt of this.prompts) {
            const oldVisible = prompt.visible;
            prompt.visible = await this.getEnabled(prompt.raw.when);

            prompt.choices = await this.getChoices(prompt);

            if (oldVisible !== prompt.visible && !prompt.visible) {
                this.removeAnswer(prompt.id);
                prompt.valueChanged = false;
            }
            else if (prompt.visible && !prompt.valueChanged) {
                let value;
                const answer = this.getAnswer(prompt.id);

                if (typeof answer !== 'undefined') {
                    value = await this.getTransformedValue(prompt, answer);
                }
                else if (typeof prompt.raw.value !== 'undefined') {
                    value = prompt.raw.value;
                }
                else {
                    value = await this.getDefaultValue(prompt);
                }
                prompt.rawValue = value;
                prompt.value = JSON.stringify(value);
                const finalValue = await this.getFilteredValue(prompt, value);
                this.setAnswer(prompt.id, finalValue);
            }
        }

        debug('Prompt answers', this.answers);
    }
    async setAnswers(newAnswers) {
        this.answers = newAnswers;
        await this.updatePrompts();
    }
    getAnswers() {
        return this.answers;
    }
    async reset(answers = {}) {
        this.prompts = [];
        await this.setAnswers(answers);
    }
    list() {
        return this.prompts;
    }
    add(data) {
        const prompt = this.generatePrompt(data);
        this.prompts.push(prompt);
        return prompt;
    }
    async start() {
        await this.updatePrompts();
    }
    findOne(id) {
        return this.prompts.find(p => p.id === id);
    }
    async setValue({id, value}) {
        const prompt = this.findOne(id);
        if (!prompt) {
            console.warn(`Prompt '${prompt}' not found`);
            return null;
        }

        const validation = await this.validateInput(prompt, value);
        if (validation !== true) {
            prompt.error = this.generatePromptError(validation);
        }
        else {
            prompt.error = null;
        }
        prompt.rawValue = value;
        const finalValue = await this.getFilteredValue(prompt, value);
        prompt.value = JSON.stringify(value);
        prompt.valueChanged = true;
        this.setAnswer(prompt.id, finalValue);
        await this.updatePrompts();
        return prompt;
    }
    async answerPrompt({id, value}, context) {
        try {
            value = JSON.parse(value);
        } catch (e) {
            // 报错就说明value的值不是JSON，于是不需要做任何处理
        }
        await this.setValue({id, value});
        return this.list();
    }
}

module.exports = new Prompts();
