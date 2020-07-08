/**
 * @file 脚手架模板组件
 * @author jinzhan
 */

import {Component} from 'san';
import {
    Form,
    Input,
    Select,
    Button
} from 'santd';
import 'santd/es/form/style';
import 'santd/es/input/style';
import 'santd/es/select/style';
import 'santd/es/button/style';

/**
 * 选择脚手架模板
 *
 * @param {Array} projectTemplateList
 * @param {Function} on-submit fire('submit')的回调
 * @param {boolean} hideSubmitBtn 隐藏提交按钮
*/
export default class ProjectList extends Component {
    static template = /* html */`
        <div class="project-template-list" style="padding: 50px">
            <s-form label-col="{{formItemLayout.labelCol}}" 
                    wrapper-col="{{formItemLayout.wrapperCol}}"
                    on-submit="handleSubmit">
                <s-formitem label="{{$t('scaffold.chooseLabel')}}">
                    <s-select value="{=currentTemplate=}" placeholder="{{$('scaffold.choosePlaceholder')}}">
                        <s-selectoption s-for="template in projectTemplateList"
                            value="{{template.value}}">{{template.label}}</s-selectoption>
                        <!----自定义的模板项---->
                        <s-selectoption>{{$t('scaffold.optionLabel')}}</s-selectoption>
                    </s-select>
                </s-formitem>

                <s-formitem label="{{$t('scaffold.customLabel')}}" 
                    s-if="projectTemplateList.length && !currentTemplate[0]">
                    <s-input 
                        placeholder="{{$t('scaffold.customLabel')}}"
                        value="{=customTemplate=}"></s-input>
                </s-formitem>

                <s-formitem s-if="!hideSubmitBtn" 
                    wrapper-col="{{formItemLayout.tailWrapperCol}}">
                    <s-button type="primary" html-type="submit">{{$t('confirmText')}}</s-button>
                </s-formitem>
            </s-form>
        </div>
    `;

    static components = {
        's-form': Form,
        's-formitem': Form.FormItem,
        's-input': Input,
        's-select': Select,
        's-button': Button,
        's-selectoption': Select.Option
    };

    initData() {
        return {
            customTemplate: '',
            currentTemplate: '',
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

    handleSubmit(e) {
        e && e.preventDefault();
        let template = this.data.get('currentTemplate');
        if (Array.isArray(template)) {
            template = template[0];
        }

        // 如果select选择的是自定义
        if (!template) {
            const customTemplate = this.data.get('customTemplate').trim();
            if (/.+:\/\/.+\w+.+\//.test(customTemplate)) {
                template = customTemplate;
            }
        }

        if (!template) {
            console.warn('No template available.');
            return;
        }

        this.fire('submit', template);
    }
}