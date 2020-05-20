/**
 * @file san项目创建
 * @author jinzhan
 */

import {Component} from 'san';
import {Form, Input, Spin} from 'santd';
import PromptsForm from '@components/prompts-form';
import {createApolloComponent} from '@lib/san-apollo';
import PROJECT_INIT_CREATION from '@graphql/project/projectInitCreation.gql';
import CONSOLE_LOG_ADDED from '@graphql/console/consoleLogAdded.gql';
import 'santd/es/input/style';
import 'santd/es/spin/style';

export default class App extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="project-create">
            <s-form labelCol="{{formItemLayout.labelCol}}"
                wrapperCol="{{formItemLayout.wrapperCol}}">
                <s-formitem label="{{$t('project.components.create.folderName')}}">
                    <s-input value="{=app.name=}"></s-input>
                    <div class="grey">{{cwd}}/{{app.name}}</div>
                </s-formitem>
            </s-form>

            <s-prompts-form prompts="{{prompts}}"
                submit-text="{{$t('project.components.create.submitText')}}"
                on-submit="onPromptsFormSubmit"></s-prompts-form>

            <s-spin class="loading" 
                    tip="{{$t('project.components.create.spinTip')}}" 
                    spinning="{{isCreating}}" 
                    size="large" />
        </div>
    `;

    static components = {
        's-form': Form,
        's-formitem': Form.FormItem,
        's-spin': Spin,
        's-input': Input,
        's-prompts-form': PromptsForm
    };

    initData() {
        return {
            isCreating: false,
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
            }
        };
    }

    attached() {
        // add a subscribe for fetch the console.log from command line
        this.observer = this.$apollo.subscribe({
            query: CONSOLE_LOG_ADDED
        });

        this.observer.subscribe({
            next(data) {
                // Notify your application with the new arrived data
                console.log({subscribe: data});
            }
        });
    }

    onPromptsFormSubmit(presets) {
        this.data.set('isCreating', true);
        this.$apollo.mutate({
            mutation: PROJECT_INIT_CREATION,
            variables: {
                name: this.data.get('app').name || '',
                presets
            }
        }).then(({data}) => {
            // 创建完成
            this.data.set('isCreating', false);

            // TODO: 跳转到项目页面
        });
    }
}