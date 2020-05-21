/**
 * @file 基于json动态创建一个form表单
 * @author jinzhan
 */
import {
    Component
} from 'san';
import {
    Form,
    Input,
    Select,
    Switch,
    Button
} from 'santd';
import 'santd/es/form/style';
import 'santd/es/input/style';
import 'santd/es/select/style';
import 'santd/es/cascader/style';
import 'santd/es/input-number/style';
import 'santd/es/switch/style';
import 'santd/es/button/style';

/**
 * 组件props
 *
 * @param {Object} prompts inquirer的prompts配置
 * @param {Function} on-submit fire('submit')的回调
 * @param {string} submit-text 提交按钮的文字
 */

export default class App extends Component {
    constructor(opts = {}) {
        super(opts);
    }

    static template = /* html */ `
      <div>
        <s-form labelCol="{{formItemLayout.labelCol}}" 
            wrapperCol="{{formItemLayout.wrapperCol}}"
            on-submit="handleSubmit">
            <template s-for="prompt in prompts">
                <s-formitem s-if="!prompt.when || condition[prompt.when]" 
                    title="{{prompt.name}}" 
                    label="{{prompt.label || prompt.message}}">
                    <template s-if="prompt.type === 'list'">
                        <s-select value="{=prompt.value=}">
                            <s-selectoption s-for="choice in prompt.choices" 
                                value="{{choice.value}}">{{choice.name}">{{choice}}</s-selectoption>
                        </s-select>
                    </template>

                    <template s-elif="prompt.type === 'input' || prompt.type === 'string'">
                        <s-input value="{=prompt.value=}"></s-input>
                    </template>

                    <template s-elif="prompt.type === 'confirm'">
                        <s-switch checked="{=prompt.value=}"
                         on-change="changeSwitch" defaultChecked="{{prompt.value}}"></s-switch>
                    </template>
                        
                    <template s-elif="prompt.type === 'checkbox'">
                        <s-select mode="multiple" value="{=prompt.value=}">
                            <s-selectoption s-for="choice in prompt.choices" 
                                value="{{choice.name}}}">{{choice.name}}</s-selectoption>
                        </s-select>
                    </template>
                </s-formitem>
            </template>

            <s-formitem s-if="prompts && prompts.length && !hideSubmitBtn" 
                wrapperCol="{{formItemLayout.tailWrapperCol}}">
              <s-button type="primary"
                        htmlType="submit">{{submitText}}</s-button>
            </s-formitem>
          </s-form>
      </div>
    `;

    static components = {
        's-form': Form,
        's-formitem': Form.FormItem,
        's-input': Input,
        's-select': Select,
        's-switch': Switch,
        's-button': Button,
        's-selectoption': Select.Option
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
                    message: 'The input is not valid E-mail!',
                }, {
                    required: true,
                    message: 'Please input your E-mail!',
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
            const value = item.value;
            if (item.type === 'string') {
                data[item.name] = value || item.default || '';
            }
            else if (item.type === 'list') {
                data[item.name] = value && typeof value === 'string' ? value
                    : (Array.isArray(value) && value.length ? item.value[0]
                        : item.choices[0].value);
            }
            else if (item.type === 'confirm') {
                data[item.name] = !!item.value;
            }
        });
        this.fire('submit', data);
    }
};
