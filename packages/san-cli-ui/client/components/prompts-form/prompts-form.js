/**
 * @file 基于json动态创建一个form表单
 * @author jinzhan, zttonly, Lohoyo
 */
import Component from '@lib/san-component';
import FormTree from './form-tree';
import './prompts-form.less';

/**
 * 组件props
 *
 * @param {Object} prompts inquirer的prompts配置
 * @param {Function} on-submit fire('submit')的回调
 * @param {string} submit-text 提交按钮的文字
 * @param {Object} form-item-layout 表格布局
 */

export default class PromptsForm extends Component {
    static template = /* html */ `
      <div>
        <s-form
            label-col="{{formItemLayout.labelCol}}" 
            wrapper-col="{{formItemLayout.wrapperCol}}"
            on-submit="handleSubmit"
            colon="{{false}}">
            <template s-for="prompt in prompts">
                <s-formitem
                    s-if="!prompt.when || condition[prompt.when]" 
                    title="{{prompt.name}}" 
                    label="{{(prompt.label || prompt.message) | textFormat}}"
                    extra="{{prompt.description | textFormat}}"
                    labelCol="{{prompt.formItemLayout.labelCol || formItemLayout.labelCol}}"
                    wrapperCol="{{prompt.formItemLayout.wrapperCol || formItemLayout.wrapperCol}}">
                    <template s-if="prompt.type === 'list'">
                        <s-select
                            value="{=prompt.value=}"
                            placeholder="{{prompt.placeholder | textFormat}}"
                            on-change="handleChange(prompt, $event)"
                            dropdownClassName={{dropdownClassName}}
                            dropdownStyle="{{dropdownStyle}}">
                            <s-select-option s-for="choice in prompt.choices" 
                                value="{{choice.value}}">{{choice.name}">{{choice}}</s-select-option>
                        </s-select>
                    </template>

                    <template s-elif="prompt.type === 'input' || prompt.type === 'string'">
                        <c-tree s-if="type(prompt.value)"
                            name="{=prompt.name=}"
                            value="{=prompt.value=}"
                            on-change="handleChange(prompt, $event)"
                        ></c-tree>
                        <s-input s-else value="{=prompt.value=}"
                            placeholder="{{prompt.placeholder | textFormat}}"
                            on-change="handleChange(prompt, $event)"
                        ></s-input>
                    </template>

                    <template s-elif="prompt.type === 'confirm'">
                        <s-switch checked="{=prompt.value=}"
                            default-checked="{{prompt.value}}"
                            on-change="handleChange(prompt, $event)">
                        </s-switch>
                    </template>

                    <template s-elif="prompt.type === 'checkbox'">
                        <s-select
                            mode="multiple"
                            value="{=prompt.value=}"
                            placeholder="{{prompt.placeholder | textFormat}}"
                            on-change="handleChange(prompt, $event)"
                            dropdownClassName={{dropdownClassName}}
                            dropdownStyle="{{dropdownStyle}}">
                            <s-select-option s-for="choice in prompt.choices" 
                                value="{{choice.name}}}"
                            >{{choice.name}}</s-select-option>
                        </s-select>
                    </template>
                </s-formitem>
            </template>

            <s-formitem s-if="prompts && prompts.length && !hideSubmitBtn" 
                wrapper-col="{{formItemLayout.tailWrapperCol}}">
                <s-button type="primary" html-type="submit">{{submitText}}</s-button>
            </s-formitem>
          </s-form>
      </div>
    `;
    static components = {
        'c-tree': FormTree
    }
    static filters = {
        textFormat(value) {
            return value && value.indexOf('.') > -1 ? this.$t(value) : value;
        }
    };
    static computed = {
        condition() {
            const prompts = this.data.get('prompts');
            const condition = {};
            prompts.forEach(prompt => condition[prompt.name] = prompt.value);
            return condition;
        }
    };

    initData() {
        return {
            emailDecorator: {
                name: 'email',
                rules: [{
                    type: 'email',
                    message: 'The input is not valid E-mail!'
                }, {
                    required: true,
                    message: 'Please input your E-mail!'
                }]
            },
            decorators: {},
            formItemLayout: {
                labelCol: {
                    xs: {
                        span: 12
                    },
                    sm: {
                        span: 4
                    }
                },
                wrapperCol: {
                    xs: {
                        span: 24
                    },
                    sm: {
                        span: 16
                    }
                },
                tailWrapperCol: {
                    xs: {
                        span: 12,
                        offset: 0
                    },
                    sm: {
                        span: 16,
                        offset: 4
                    }
                }
            }
        };
    }

    attached() {
        const prompts = this.data.get('prompts');
        // TODO: to be checked.
        prompts.forEach((item, index) => {
            this.data.set(`decorators.${item.name}`, {
                name: item.name,
                rules: [{
                    required: true,
                    message: `${item.name} should not be empty`
                }]
            });
        });
    }
    formateValue(item, newValue) {
        const value = newValue === undefined ? item.value : newValue;
        if (item.type === 'string' || item.type === 'input') {
            return value || item.default || '';
        }
        if (item.type === 'list') {
            return value && typeof value === 'string' ? value
                : (Array.isArray(value) && value.length ? value[0]
                    : item.choices[0].value);
        }
        if (item.type === 'confirm') {
            return !!value;
        }
        return value;
    }
    handleChange(prompt, value) {
        this.fire('valuechanged', {prompt, value: this.formateValue(prompt, value)});
    }
    handleSubmit(e) {
        e && e.preventDefault();
        const prompts = this.data.get('prompts');
        const data = {};
        prompts.forEach(item => {
            if (item.when) {
                const el = prompts.find(el => el.name === item.when);
                if (!el || !el.value) {
                    return false;
                }
            }
            data[item.name] = this.formateValue(item);
        });
        this.fire('submit', data);
    }
    type(value) {
        return typeof value === 'object' && value !== null;
    }
}
