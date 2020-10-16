/**
 * @file 任务管理
 * @author jinzhan
 */
import Component from '@lib/san-component';
import TaskNav from '@components/task/task-nav';
import TaskCard from '@components/task/task-card';
import TaskContent from '@components/task/task-content';
import TASKS from '@graphql/task/tasks.gql';
import TASK from '@graphql/task/task.gql';
import './content.less';

export default class Task extends Component {
    static template = /* html */`
    <div class="{{taskName ? 'task' : 'task-home'}}">
        <c-task-nav 
            tasks="{{tasks}}" 
            queryName="{{taskName}}" 
            s-if="{{taskName}}"
        />
        <c-task-card
            s-else
            tasks="{{tasks}}" 
        />
        <c-task-content s-if="{{taskName}}" taskInfo="{{taskInfo}}" ></c-task-content>
    </div>
    `;
    static components = {
        'c-task-nav': TaskNav,
        'c-task-card': TaskCard,
        'c-task-content': TaskContent
    };

    initData() {
        return {
            tasks: [],
            pageLoading: true
        };
    }

    async attached() {
        const tasksData = await this.$apollo.query({query: TASKS});
        if (tasksData.data) {
            this.data.set('tasks', tasksData.data.tasks);
        }

        this.data.set('pageLoading', false);

        const taskName = this.data.get('taskName');

        if (taskName) {
            const taskInfo = await this.getTaskInfo(taskName);
            this.data.set('taskInfo', taskInfo);
        }

        this.watch('taskName', async task => {
            if (!task) {
                return;
            }
            const taskInfo = await this.getTaskInfo(task);
            this.data.set('taskInfo', taskInfo);
        });
    }

    async getTaskInfo(id) {
        if (!id) {
            return {};
        }

        const query = await this.$apollo.query({
            query: TASK,
            variables: {
                id
            }
        });

        const data = query.data ? query.data.task : {};
        data.prompts && data.prompts.forEach(prompt => {
            if (!prompt.value || typeof prompt.value !== 'string') {
                return;
            }
            try {
                prompt.value = JSON.parse(prompt.value);

                if (!prompt.choices) {
                    return;
                }

                prompt.choices.forEach(choice => {
                    if (!choice.value || typeof choice.value !== 'string') {
                        return;
                    }
                    try {
                        choice.value = JSON.parse(choice.value);
                    }
                    catch (e) {
                        console.log(`Prompt choices parse error: ${e}`);
                    }
                });
            }
            catch (e) {
                console.log(`Prompt parse error: ${e}`);
            }
        });
        return data;
    }
}
