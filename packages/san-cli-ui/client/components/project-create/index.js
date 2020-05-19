/**
 * @file san项目创建
 * @author jinzhan
 */

import {Component} from 'san';
import {Form, Input} from 'santd';
import PromptsForm from '@components/prompts-form';
import {createApolloComponent} from '@lib/san-apollo';
import PROJECT_INIT_CREATION from '@graphql/project/projectInitCreation.gql';
import 'santd/es/input/style';

export default class App extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="project-create">
            <s-form labelCol="{{formItemLayout.labelCol}}"
                wrapperCol="{{formItemLayout.wrapperCol}}">
                <s-formitem label="项目文件夹">
                    <s-input value="{=app.name=}"></s-input>
                </s-formitem>
            </s-form>

            <s-prompts-form prompts="{{prompts}}" on-submit="onPromptsFormSubmit"></s-prompts-form>
        </div>
    `;

    static components = {
        's-form': Form,
        's-formitem': Form.FormItem,
        's-input': Input,
        's-prompts-form': PromptsForm
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
            }
        };
    }

    attached() {}

    onPromptsFormSubmit(presets) {
        this.$apollo.mutate({
            mutation: PROJECT_INIT_CREATION,
            variables: {
                name: this.data.get('app').name || '',
                presets
            }
        }).then(({data}) => {
            console.log('Yes, you did it', {data});
        });
    }
}