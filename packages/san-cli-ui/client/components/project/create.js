/**
 * @file san项目创建
 * @author jinzhan, Lohoyo
 */

import {router} from 'san-router';
import Component from '@lib/san-component';
import PromptsForm from '@components/prompts-form';
import PROJECT_CREATION from '@graphql/project/projectCreation.gql';
import './create.less';

export default class ProjectCreate extends Component {
    static template = /* html */`
        <div class="flex-all project-options">
            <div class="container">
                <s-form
                    label-col="{{formItemLayout.labelCol}}"
                    wrapper-col="{{formItemLayout.wrapperCol}}"
                    colon="{{false}}">
                    <s-formitem
                        required
                        validateStatus="{{isAppNameValidated ? '' : 'error'}}"
                        label="{{$t('project.components.create.folderName')}}">
                        <s-input class="app-name" value="{=app.name=}"></s-input>
                        <div class="cwd">{{cwd}}/{{app.name}}</div>
                    </s-formitem>
                </s-form>

                <c-prompts-form
                    s-ref="form"
                    prompts="{{prompts}}"
                    hide-submit-btn="true"
                    submit-text="{{$t('project.components.create.submitText')}}"
                    on-submit="onPromptsFormSubmit"
                    dropdownClassName="create-dropdown"
                    dropdownStyle="{{{'border-radius': '21px'}}}">
                </c-prompts-form>
            </div>
        </div>
    `;

    static components = {
        'c-prompts-form': PromptsForm
    };

    initData() {
        return {
            app: {
                name: ''
            },
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
                }
            },
            isAppNameValidated: true
        };
    }

    submit(data) {
        this.formData = data;
        this.ref('form').handleSubmit();
    }

    onPromptsFormSubmit(presets) {
        const name = this.data.get('app.name');
        if (!name) {
            this.data.set('isAppNameValidated', false);
            document.querySelector('.project-options').scrollTop = 0;
            return;
        }
        this.data.set('isAppNameValidated', true);

        this.fire('setloading', true);
        if (!presets.name) {
            presets.name = name;
        }
        this.$apollo.mutate({
            mutation: PROJECT_CREATION,
            variables: {
                name,
                presets,
                ...this.formData
            }
        }).then(({data}) => {
            // 创建完成
            this.fire('setloading', false);

            // TODO: 跳转到项目页面
            setTimeout(() => router.locator.redirect('/'));
        });
    }
}
