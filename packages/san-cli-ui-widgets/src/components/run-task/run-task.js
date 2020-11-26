/**
 * @file run-task运行任务组件
 * @author zttonly, Lohoyo
 */

import TASK from 'san-cli-ui/client/graphql/task/task.gql';
import TASK_RUN from 'san-cli-ui/client/graphql/task/taskRun.gql';
import TASK_STOP from 'san-cli-ui/client/graphql/task/taskStop.gql';
import TASK_CHANGED from 'san-cli-ui/client/graphql/task/taskChanged.gql';
import taskIconColor from 'san-cli-ui/client/lib/utils/task-icon-color';
import './run-task.less';

export default {
    template: /* html */`
        <div class="dashboard-widget-run-task">
            <template s-if="task">
                <div class="task-icon" style="color: {{iconColor}}">{{task.name[0] | upper}}</div>
                <div class="task-name text" style="color: {{iconColor}}">{{task.name}}</div>
                <div class="task-description text">{{description ? $t(description) : ''}}</div>
                <s-button
                    s-if="task.status !== 'running'"
                    type="primary"
                    on-click="runTask"
                    class="run-task-btn task-btn stopped">
                    {{$t('task.run')}}
                </s-button>
                <s-button
                    s-else
                    type="primary"
                    on-click="stopTask"
                    class="run-task-btn task-btn running">
                    {{$t('task.stop')}}
                </s-button>
                <s-router-link to="/project/task/{{taskId}}">
                    <s-button class="run-task-btn jump-btn">
                        {{$t('dashboard.widgets.run-task.page')}}
                    </s-button>
                </s-router-link>
            </template>
        </div>
    `,
    computed: {
        taskId() {
            let id = this.data.get('data.config.task');
            try {
                id = JSON.parse(id);
            }
            catch (error) {}
            return id;
        },
        description() {
            const task = this.data.get('task');
            return task ? (task.status === 'idle' && task.description) || `task.status.${task.status}` : '';
        },
        iconColor() {
            return taskIconColor(this.data.get('task.name'));
        }
    },
    filters: {
        upper(str) {
            return str.toUpperCase();
        }
    },
    initData() {
        return {
            task: null
        };
    },
    attached() {
        const taskId = this.data.get('taskId');
        taskId && this.init();

        this.watch('taskId', value => {
            value && this.init();
        });
        const observer = this.$apollo.subscribe({
            query: TASK_CHANGED,
            variables: {
                id: taskId
            }
        });
        observer.subscribe({
            next: result => {
                const {data, error, errors} = result;
                if (data && data.taskChanged && data.taskChanged.name !== this.data.get('taskId')) {
                    return;
                }
                /* eslint-disable no-console */
                if (error || errors) {
                    console.log('err');
                }
                if (data && data.taskChanged) {
                    this.data.set('task.status', data.taskChanged.status);
                }
            },
            error: err => {
                console.log('error', err);
                /* eslint-enable no-console */
            }
        });
    },
    async init() {
        const task = await this.$apollo.query({
            query: TASK,
            variables: {
                id: this.data.get('taskId')
            }
        });
        if (task && task.data) {
            this.data.set('task', task.data.task);
        }
    },
    runTask() {
        if (this.data.get('task.status') === 'running') {
            return;
        }
        this.$apollo.mutate({
            mutation: TASK_RUN,
            variables: {
                id: this.data.get('taskId')
            }
        });
    },

    stopTask() {
        this.$apollo.mutate({
            mutation: TASK_STOP,
            variables: {
                id: this.data.get('taskId')
            }
        });
    }
};
