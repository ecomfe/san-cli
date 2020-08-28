/**
 * @file 任务详情
 * @author jinzhan
 */

import Component from '@lib/san-component';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import ClientAddon from '../client-addon/client-addon';
import TASK from '@graphql/task/task.gql';
import TASK_RUN from '@graphql/task/taskRun.gql';
import TASK_STOP from '@graphql/task/taskStop.gql';
import TASK_CHANGED from '@graphql/task/taskChanged.gql';
import TASK_LOG_ADDED from '@graphql/task/taskLogAdded.gql';
import TASK_LOGS from '@graphql/task/taskLogs.gql';
import 'xterm/css/xterm.css';
import './task-content.less';

const getSanCommand = command => {
    command = command.trim();
    if (/san(?:-cli\/index\.js)?\s+(serve|build)(?:\s+--\S+(?:\s+\S+)?)*$/.test(command)) {
        return RegExp.$1;
    }
    return '';
};

const getProgress = data => {
    let progress = 0;
    // 这个进度可能是多项编译的进度，这里进行简单的求算术平均值
    const progressTypes = typeof data === 'object' ? Object.keys(data) : [];
    const len = progressTypes.length;
    progressTypes.forEach(item => {
        progress += data[item] * 100;
    });
    if (len) {
        progress /= len;
        progress = ~~progress;
    }
    return progress;
};

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

        <div class="task-main-views">
            <div class="task-bar">
                <div class="task-config">
                    <s-button type="primary" 
                        icon="{{isRunning ? 'loading' : 'caret-right'}}" 
                        loading="{{taskPending}}"
                        on-click="execute">{{isRunning ? $t('task.stop') : $t('task.run')}}</s-button>
                    <s-button type="default" icon="setting">{{$t('task.setting')}}</s-button>
                </div>

                <div class="task-view-tabs" s-if="views.length">
                    <div on-click="setViewIndex(0)"
                        class="task-view-tab {{currentIndex === 0 ? 'active' : ''}}">
                        <s-icon type="code" /><span class="task-view-tab-label">{{$t('task.output')}}</span>
                    </div>
                    <div class="task-view-tab {{currentIndex === index + 1 ? 'active' : ''}}"
                        on-click="setViewIndex(index + 1)"
                        key="{{'k-' + index}}" s-for="view,index in views">
                        <s-icon type="{{view.icon}}" /><span class="task-view-tab-label">{{$t(view.label)}}</span>
                    </div>
                </div>
            </div>

            <div class="task-view-contents">
                <!-----默认视图：命令行输出---->
                <div class="task-view-content {{currentIndex ? 'hidden' : ''}}">
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
                </div>

                <!-----自定义视图：第三方组件---->
                <fragment key="{{index}}" s-for="view,index in views">
                    <div class="task-view-content {{index + 1 !== currentIndex ? 'hidden' : ''}}">
                        <c-client-addon client-addon="{{view.component}}" data="{{sharedData}}" />
                    </div>
                </fragment>
            </div>
        </div>
    </div>
    `;

    static components = {
        'c-client-addon': ClientAddon
    };

    initData() {
        return {
            // 请求发送中
            taskPending: false,

            // 脚本执行中
            isRunning: false,

            // 额外的任务视图
            views: [],

            currentIndex: -1,

            sharedData: {}
        };
    }

    setViewIndex(index) {
        this.data.set('currentIndex', index);
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

            // 5. 获取编译结果
            // TODO: 这个地方后续应该放到addon组件里面
            this.getSharedData();
        });
    }

    async getSharedData() {
        const command = this.data.get('taskInfo.command');
        const sanCommandType = getSanCommand(command);
        // 如果是san的任务，则获取san编译的数据
        if (sanCommandType) {
            const id = `san.cli.${sanCommandType}`;
            const statsId = `${id}-stats`;
            // ..............编译结果..............
            // 获取上一次san-cli编译结果进行展示
            const sharedData = await this.$getSharedData(statsId) || {};
            this.data.set('sharedData', sharedData);

            // 实时更新san-cli编译的最终结果
            this.$watchSharedData(statsId, data => {
                this.data.merge('sharedData', data);
            });

            // ..............编译进度..............
            // 更新san-cli编译进度
            const progressId = `${id}-progress`;
            this.$watchSharedData(progressId, data => {
                this.data.set('sharedData.progress', getProgress(data));
            });

            // ..............编译状态..............
            // 实时更新san-cli编译状态
            const statusId = `${id}-status`;
            this.$watchSharedData(statusId, status => {
                this.data.set('sharedData.status', status);
            });
        }
    }

    // 设置上一次产生的log
    async setConsoleLogLast(id) {
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
    async updateTask() {
        const id = this.data.get('taskInfo.name');
        const query = await this.$apollo.query({
            query: TASK,
            variables: {id}
        });
        let views = [];
        const task = query.data.task;
        if (task) {
            this.setStatu(task.status);
            views = task.views || [];
        }
        this.data.set('currentIndex', views.length ? 1 : 0);
        this.data.set('views', views);
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
