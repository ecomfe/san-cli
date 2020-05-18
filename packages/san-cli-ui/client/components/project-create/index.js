/**
 * @file 项目创建容器组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import PromptsForm from '@components/prompts-form';
import {createApolloComponent, createApolloDataComponent} from '@lib/san-apollo';
import PROJECT_INIT_CREATION from '@graphql/project/projectInitCreation.gql';

export default class Create extends createApolloComponent(Component) {

    static template = /* html */`
        <div class="project-create">
            <button on-click="fetchTemplate">初始化</button>
            <s-prompts-form prompts="{{prompts}}" on-submit="onPromptsFormSubmit"></s-prompts-form>
        </div>
    `;

    static components = {
        's-prompts-form': PromptsForm
    };

    initData() {
        return {
            prompts: []
        };
    }

    attached() {}

    fetchTemplate() {
        this.$apollo.mutate({
            mutation: PROJECT_INIT_CREATION
        }).then(({data}) => {
            if (data.projectInitCreation && data.projectInitCreation.prompts) {
                this.data.set('prompts', this.formatPrompts(data.projectInitCreation.prompts));
            }
        });
    }

    formatPrompts(data) {
        // 把default赋值给value
        data.forEach(item => item.default && (item.value = item.default));
        // TODO: 增加文件夹的选项
        return data;
    }

    createProject() {
        console.log('createProject...');
    }

    onPromptsFormSubmit(data) {
        console.log('onPromptsFormSubmit:', data);
    }
}