/**
 * @file 脚手架模板组件
 * @author jinzhan, Lohoyo
 */

import {message} from 'santd';
import Component from '@lib/san-component';
import './template-list.less';

/**
 * 选择脚手架模板
 *
 * @param {Array} projectTemplateList 模板列表
 * @param {Function} on-submit fire('submit')的回调
 * @param {boolean} hideSubmitBtn 隐藏提交按钮
*/
export default class ProjectList extends Component {
    static template = /* html */`
        <div class="flex-all project-template-list">
            <s-form on-submit="handleSubmit" colon="{{false}}">
                <s-formitem label="{{$t('scaffold.chooseLabel')}}">
                    <s-tooltip title="{{$t('scaffold.tooltip')}}" class="question-icon">
                        <s-icon type="question-circle"></s-icon>
                    </s-tooltip>
                    <s-select
                        value="{=currentTemplate=}"
                        dropdownClassName="template-list-dropdown"
                        dropdownStyle="{{{'border-radius': '18px'}}}"
                        on-select="templateChange">
                        <s-select-option s-for="template in projectTemplateList" value="{{template.value}}">
                            {{template.label}}
                        </s-select-option>
                        <!----自定义的模板项---->
                        <s-select-option value="">
                            {{$t('scaffold.optionLabel')}}
                        </s-select-option>
                    </s-select>
                    <div class="template-all" s-if="showTmplList">
                        <div s-for="tmpl in showTmplList" 
                            class="template-item {{currentTemplate[0] === tmpl.link ? 'active' : ''}}"
                        >
                            <a href="{{tmpl.link}}" class="template-title">
                                {{tmpl.title}}
                            </a>
                            <div class="template-desc">
                                {{tmpl.description}}
                            </div>
                        </div>
                    </div>
                </s-formitem>

                <s-formitem label="{{$t('scaffold.customLabel')}}"
                    s-if="projectTemplateList.length && !currentTemplate[0]">
                    <s-input 
                        class="com-santd-input-normal"
                        placeholder="{{$t('scaffold.customLabel')}}"
                        value="{=customTemplate=}"></s-input>
                </s-formitem>

                <s-formitem label="{{$t('scaffold.useCache')}}" class="cache-switch">
                    <s-switch on-change='changeUseCache' defaultChecked="{{useCache}}"></s-switch>
                </s-formitem>

                <s-formitem s-if="!hideSubmitBtn"
                    wrapper-col="{{formItemLayout.tailWrapperCol}}">
                    <s-button type="primary" html-type="submit">{{$t('confirmText')}}</s-button>
                </s-formitem>
            </s-form>
        </div>
    `;

    initData() {
        return {
            customTemplate: '',
            currentTemplate: '',
            showTmplList: null,
            formItemLayout: {
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
            },
            useCache: true
        };
    }
    attached() {
        const currentTemplate = this.data.get('currentTemplate');
        this.templateChange(Array.isArray(currentTemplate) ? currentTemplate[0] : null);
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
            else {
                message.warn('No template available.');
                return;
            }
        }

        this.fire('submit', {
            template,
            useCache: this.data.get('useCache')
        });
    }

    changeUseCache(e) {
        this.data.set('useCache', e);
    }

    templateChange(value) {
        if (!value) {
            this.data.set('showTmplList', null);
            return;
        }
        const projectTemplateList = this.data.get('projectTemplateList');
        const showTmplList = projectTemplateList.map(item => {
            const description = item.description ? this.$t(item.description) || item.description : '';
            return {
                title: item.label.replace(/^\w+:/, ''),
                link: item.value,
                description
            };
        });
        this.data.set('showTmplList', showTmplList);
    }
}
