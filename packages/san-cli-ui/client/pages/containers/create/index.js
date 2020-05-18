/**
 * @file 项目创建容器组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {createApolloComponent, createApolloDataComponent} from '@lib/san-apollo';
import PROJECT_INIT_CREATION from '@graphql/project/projectInitCreation.gql';

export default class Create extends createApolloComponent(Component) {

    static template = /* html */`
        <div class="project-create">
            <div>
                基本选项
                <div>文件夹：<input value="{=folder=}" /></div>
                <div><input type="checkbox" value="{=offline=}" />使用本地缓存模板</div>
                <button on-click="fetchTemplate">下一步(PROJECT_INIT_CREATION)</button>
            </div>

            <div>
                项目预设
                
            </div>

            <button type="button" on-click="createProject" class="create">创建</button>
        </div>
    `;

    initData() {
        return {
            title: 'San CLI',
            cwd: '~'
        };
    }

    attached() {}

    fetchTemplate() {
        this.$apollo.mutate({
            mutation: PROJECT_INIT_CREATION
        });
    }

    createProject() {
        console.log('createProject...');
    }
}

