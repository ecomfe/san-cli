/**
 * @file run-task运行任务组件
 * @author zttonly
 */

import TASK from 'san-cli-ui/client/graphql/task/task.gql';
import TASK_RUN from 'san-cli-ui/client/graphql/task/taskRun.gql';
import TASK_STOP from 'san-cli-ui/client/graphql/task/taskStop.gql';
import TASK_CHANGED from 'san-cli-ui/client/graphql/task/taskChanged.gql';
import avatars from 'san-cli-ui/client/lib/utils/avatars';
import {Icon, Button} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import './run-task.less';

export default {
    template: /* html */`
        <div class="run-task">
            <template s-if="task">
                <div class="task-nav info status-{{task.status}} {{selected ? 'selected' : ''}}">
                    <div class="task-nav-item">
                        <div class="task-icon">
                            <img s-if="task.icon" src="{{task.icon}}" />
                            <img s-else src="{{avatars(task.name)}}" />
                        </div>
                        <div class="task-info">
                            <div class="task-info-name">{{task.name}}</div>
                            <div class="task-info-description">{{description ? $t(description) : ''}}</div>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <s-button
                        s-if="task.status !== 'running'"
                        icon="caret-right"
                        type="primary"
                        on-click="runTask"
                    >{{$t('task.run')}}</s-button>

                    <s-button
                        s-else
                        icon="stop"
                        type="primary"
                        on-click="stopTask"
                    >{{$t('task.stop')}}</s-button>

                    <s-button
                        icon="project"
                        href="/#/tasks/{{taskId}}"
                    >{{$t('dashboard.widgets.run-task.page')}}</s-button>
                </div>
            </template>
        </div>
    `,
    components: {
        's-icon': Icon,
        's-button': Button
    },
    computed: {
        taskId() {
            const task = this.data.get('widget.config.task');
            let id = '';
            if (task && task[0]) {
                try {
                    id = JSON.parse(task[0]);
                }
                catch (error) {}
            }
            return id;
        },
        description() {
            const task = this.data.get('task');
            return task ? (task.status === 'idle' && task.description) || `task.status.${task.status}` : '';
        }
    },
    initData() {
        return {
            widget: null,
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
    },
    avatars(name) {
        return avatars(name, 'initials');
    }
};
