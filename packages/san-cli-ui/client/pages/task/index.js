/**
 * @file 任务管理
 */
import {Component} from 'san';
import {Link} from 'san-router';
import {createApolloComponent} from '@lib/san-apollo';
import TASK from '@graphql/task/tasks.gql';
import Layout from '@components/layout';
import TaskNav from '@components/task-nav';
import TaskContent from '@components/task-content';
import {Icon, Button, Spin} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class Task extends createApolloComponent(Component) {
    static template = /* html */`
        <c-layout nav="{{['task']}}" title="{{$t('task.title')}}">
            <template slot="right"></template>
            <div slot="content" class="{{route.query.task ? 'task' : 'task-home'}}">
                <c-task-nav 
                    tasks="{{tasks}}" 
                    queryName="{{route.query.task}}" 
                    routePath="{{routePath}}"></c-task-nav>
                <c-task-content s-if="{{route.query.task}}"></c-task-content>
            </div>
        </c-layout>
    `;
    static components = {
        's-icon': Icon,
        's-link': Link,
        's-button': Button,
        's-spin': Spin,
        'c-layout': Layout,
        'c-task-nav': TaskNav,
        'c-task-content': TaskContent
    };

    initData() {
        return {
            tasks: [],
            routePath: '',
            pageLoading: true
        };
    }

    async attached() {
        this.data.set('title', this.$t('detail.title'));
        let res = await this.$apollo.query({query: TASK});
        if (res.data) {
            this.data.set('tasks', res.data.tasks);
        }

        let routePath = this.data.get('route.path');
        if (routePath) {
            routePath = routePath.split('/')[1];
            this.data.set('routePath', routePath);
        }
    }
};
