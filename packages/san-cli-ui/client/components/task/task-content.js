/**
 * @file 任务详情
 * @author jinzhan
 */

import Component from '@lib/san-component';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import ClientAddon from '../client-addon/client-addon';
import 'xterm/css/xterm.css';
import TASK from '@graphql/task/task.gql';
import TASK_RUN from '@graphql/task/taskRun.gql';
import TASK_STOP from '@graphql/task/taskStop.gql';
import TASK_CHANGED from '@graphql/task/taskChanged.gql';
import TASK_LOG_ADDED from '@graphql/task/taskLogAdded.gql';
import TASK_LOGS from '@graphql/task/taskLogs.gql';
import './task-content.less';
import clientAddonData from './task-dashboard-data.json';

/**
 * 组件props
 *
 * @param {Object} taskInfo 当前的任务信息
 */

export default class TaskContent extends Component {
    static template = /* html */`
    <div class="task-content">
        <div class="task-head">
            <span class="task-name"><s-icon type="file-text" />{{taskInfo.name}}</span>
            <span class="task-command">{{taskInfo.command}}</span>
        </div>

        <div class="task-config">
            <s-button type="primary" 
                icon="{{isRunning ? 'stop' : 'caret-right'}}" 
                loading="{{taskPending}}"
                on-click="execute">{{isRunning ? $t('task.stop') : $t('task.run')}}</s-button>
            <s-button type="default" icon="setting">{{$t('task.setting')}}</s-button>
        </div>

        <s-tabs defaultActiveKey="1">
            <!---默认的命令行视图---->
            <s-tabpane key="1" tab="{{$t('task.output')}}">
                <div class="task-output-opt">
                    <div class="task-output-head">
                        <span class="task-output-head-output">
                            <s-icon type="code" />{{$t('task.output')}}
                        </span>
            
                        <s-tooltip title="{{$t('task.bottom')}}">
                            <s-icon type="enter" class="task-xterm-btn" on-click="scrollToBottom" />
                        </s-tooltip>
            
                        <s-tooltip title="{{$t('task.copy')}}">
                            <s-icon type="copy" class="task-xterm-btn" on-click="copyContent" />
                        </s-tooltip>
            
                        <s-tooltip title="{{$t('task.clear')}}">
                            <s-icon type="delete" class="task-xterm-btn" on-click="clear" />
                        </s-tooltip>
                    </div>
                </div>
                <div class="task-output-content"></div>
            </s-tabpane>

            <s-tabpane key="{{'v-' + index}}" tab="{{$t(view.label)}}" s-for="view,index in views">
                <c-client-addon client-addon="{{view.component}}" data="{{view.data}}" />
            </s-tabpane>
        </s-tabs>
    </div>
    `;

    static components = {
        'c-client-addon': ClientAddon
    };

    initData() {
        return {
            // clientAddon测试数据
            clientAddonData,

            // 请求发送中
            taskPending: false,

            // 脚本执行中
            isRunning: false,

            // TODO: 先写死测试一下，待完善
            views: [{
                component: 'san-cli.components.dashboard',
                icon: 'dashboard',
                id: 'org.webpack.views.dashboard',
                label: 'addons.dashboard.title'
            },
            {
                component: 'org.webpack.components.analyzer',
                icon: 'donut_large',
                id: 'org.webpack.views.analyzer',
                label: 'addons.analyzer.title'
            }]
        };
    }

    async attached() {
        this.nextTick(() => {
            this.initTerminal();
            window.addEventListener('resize', () => {
                this.fitAddon.fit();
            });
        });
        this.watch('taskInfo.name', name => {
            if (!name) {
                return;
            }
            // 0. 获取task的信息，task可能正在执行
            this.updateTask();

            // 1. 清除 -> 界面上的log
            this.clear();

            // 2. 读取 -> 历史记录中的log
            this.setConsoleLogLast(name);

            // 3. 订阅 -> 命令产生的log
            this.subscribeConsoleLog(name);

            // 4. 监听命令行的变化
            this.subscribeTaskChanged(name);
        });

        this.$watchSharedData('san.cli.serve', data => {
            console.log('sharedData:', data);
        });

        const sharedData = await this.$getSharedData('san.cli.serve-stats');
        this.data.get('views').some(item => {
            if (item.id === 'org.webpack.views.dashboard') {
                item.data = sharedData.value;
                return true;
            }
        });
        console.log({sharedData});
    }

    // 设置历史log
    async setConsoleLogLast(id) {
        // TASK_LOGS
        const query = await this.$apollo.query({
            query: TASK_LOGS,
            variables: {
                id: this.data.get('taskInfo.name')
            }
        });
        const taskLogs = query.data.taskLogs;
        const logs = taskLogs && taskLogs.logs;
        if (taskLogs.logs) {
            const logsText = logs.map(log => log.text).join('\n');
            this.setContent(logsText);
        }
    }

    // 获取task的状态
    async updateTask(id) {
        const query = await this.$apollo.query({
            query: TASK,
            variables: {
                id: this.data.get('taskInfo.name')
            }
        });
        const task = query.data.task;
        if (task) {
            this.setStatu(task.status);
        }
        const views = this.data.get('views');
        views.forEach((view, index) => {
            window.ClientAddonApi.awaitComponent(view.component)
                .then(Component => {
                    const el = this.el.querySelector(`custom-view-${index + 2}`);
                    new Component().attach(el);
                })
                .catch(e => {
                    console.log(`awaitComponent ${view.component} error: ${e}`);
                });
        });
    }

    subscribeTaskChanged(id) {
        // 避免重复订阅
        if (this.taskChangeSubscription) {
            this.taskChangeSubscription.unsubscribe();
        }
        this.taskChangeSubscription = this.$apollo.subscribe({
            query: TASK_CHANGED,
            variables: {
                id
            }
        }).subscribe({
            next: ({data}) => {
                const status = data.taskChanged.status;
                this.setStatu(status);
            }
        });
    }

    subscribeConsoleLog(id) {
        // 避免重复订阅
        if (this.consoleLogSubscription) {
            this.consoleLogSubscription.unsubscribe();
        }
        this.consoleLogSubscription = this.$apollo.subscribe({
            query: TASK_LOG_ADDED,
            variables: {
                id
            }
        }).subscribe({
            next: ({data}) => {
                this.setContent(data.taskLogAdded.text);
            }
        });
    }

    setStatu(type) {
        switch (type) {
            case 'pending':
                this.data.set('taskPending', true);
                break;

            case 'running':
                this.data.set('taskPending', false);
                this.data.set('isRunning', true);
                break;

            // Maybe
            // case 'idle':
            // case 'finished':
            // case 'terminated':
            // case 'done':
            default:
                this.data.set('taskPending', false);
                this.data.set('isRunning', false);
        }
    }

    execute() {
        if (this.data.get('taskPending')) {
            return;
        }
        const isRunning = this.data.get('isRunning');
        this.setStatu('pending');
        const id = this.data.get('taskInfo.name');
        isRunning ? this.stopTask(id) : this.runTask(id);
    }

    async runTask(id) {
        await this.$apollo.mutate({
            mutation: TASK_RUN,
            variables: {id}
        });
    }

    async stopTask(id) {
        await this.$apollo.mutate({
            mutation: TASK_STOP,
            variables: {id}
        });
    }

    initTerminal() {
        const theme = {
            foreground: '#2c3e50',
            background: '#fff',
            cursor: '#fff',
            selection: '#e6f7ff'
        };

        const terminal = new Terminal({
            theme
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(document.querySelector('.task-output-content'));
        fitAddon.fit();
        this.terminal = terminal;
        this.fitAddon = fitAddon;
    }

    /**
     * 这里的setContent是增量添加log的
     *
     * @param {string} value 值
     * @param {boolean} ln 是否换行
     * @return {undefined}
    */
    setContent(value, ln = true) {
        if (value.indexOf('\n') !== -1) {
            value.split('\n').forEach(t => this.setContent(t));
            return;
        }
        if (typeof value === 'string') {
            this.terminal[ln ? 'writeln' : 'write'](value);
        }
        else {
            this.terminal.writeln('');
        }
    }

    addLog(log) {
        this.setContent(log.text, log.type === 'stdout');
    }

    clear() {
        this.terminal.clear();
    }

    scrollToTop() {
        this.terminal.scrollToTop();
    }

    scrollToBottom() {
        this.terminal.scrollToBottom();
    }

    copyContent() {
        const textarea = this.terminal.textarea;
        if (!textarea) {
            return;
        }
        const hasSelection = !this.terminal.hasSelection();
        const textValue = textarea.value;
        try {
            if (hasSelection) {
                this.terminal.selectAll();
            }
            const selection = this.terminal.getSelection();
            textarea.value = selection;
            textarea.select();
            document.execCommand('copy');
        }
        finally {
            textarea.value = textValue;
            if (hasSelection) {
                this.terminal.clearSelection();
            }
        }
    }
}
