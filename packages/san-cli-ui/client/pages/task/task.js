/**
 * @file 任务管理
 */
import Component from '@lib/san-component';
import {createApolloComponent} from '@lib/san-apollo';
import TASKS from '@graphql/task/tasks.gql';
import TASK from '@graphql/task/task.gql';
import Layout from '@components/layout';
import TaskNav from '@components/task/task-nav';
import TaskCard from '@components/task/task-card';
import TaskContent from '@components/task/task-content';
import './task.less';

export default class Task extends createApolloComponent(Component) {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}"
            nav="{{['tasks']}}"
            title="{{$t('task.title')}}"
            page-loading="{=pageLoading=}"
        >
            <template slot="right"></template>
            <div slot="content" class="{{taskName ? 'task' : 'task-home'}}">
                <c-task-nav 
                    tasks="{{tasks}}" 
                    queryName="{{taskName}}" 
                    routePath="{{routePath}}"
                    s-if="{{taskName}}" />
                <c-task-card
                    s-else
                    tasks="{{tasks}}" 
                    queryName="{{taskName}}" 
                    routePath="{{routePath}}" />

                <c-task-content s-if="{{taskName}}" taskInfo="{{taskInfo}}" ></c-task-content>
            </div>
        </c-layout>
    `;
    static components = {
        'c-layout': Layout,
        'c-task-nav': TaskNav,
        'c-task-card': TaskCard,
        'c-task-content': TaskContent
    };

    static computed = {
        taskName() {
            return this.data.get('route.query.task');
        }
    };

    initData() {
        return {
            tasks: [],
            routePath: '',
            pageLoading: true
        };
    }

    async attached() {
        const tasksData = await this.$apollo.query({query: TASKS});

        if (tasksData.data) {
            this.data.set('tasks', tasksData.data.tasks);
        }
        this.data.set('pageLoading', false);
        let routePath = this.data.get('route.path');

        if (routePath) {
            routePath = routePath.split('/')[1];
            this.data.set('routePath', routePath);
        }

        const taskName = this.data.get('taskName');

        if (taskName) {
            const taskInfo = await this.getTaskInfo(taskName);
            this.data.set('taskInfo', taskInfo);
        }

        this.watch('route.query.task', async task => {
            const taskInfo = await this.getTaskInfo(task);
            this.data.set('taskInfo', taskInfo);
        });
    }

    async getTaskInfo(id) {
        if (!id) {
            return {};
        }
        const res = await this.$apollo.query({
            query: TASK,
            variables: {
                id
            }
        });
        return res.data ? res.data.task : {};
    }
}