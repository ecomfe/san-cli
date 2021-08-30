/**
 * @file 任务详情
 * @author jinzhan, Lohoyo
 */

import Component from '@lib/san-component';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';
import ClientAddon from '../client-addon/client-addon';
import PromptsList from '../prompts-form/prompts-form';
import TASK from '@graphql/task/task.gql';
import TASK_RUN from '@graphql/task/taskRun.gql';
import TASK_STOP from '@graphql/task/taskStop.gql';
import TASK_CHANGED from '@graphql/task/taskChanged.gql';
import TASK_LOG_ADDED from '@graphql/task/taskLogAdded.gql';
import TASK_LOGS from '@graphql/task/taskLogs.gql';
import PROMPT_ANSWER from '@graphql/prompt/promptAnswer.gql';
import TASK_SAVE_PARAMETERS from '@graphql/task/taskSaveParameters.gql';
import TASK_RESTORE_PARAMETERS from '@graphql/task/taskRestoreParameters.gql';
import UI_THEME from '@graphql/theme/theme.gql';
import 'xterm/css/xterm.css';
import './task-content.less';

/**
 * 获取san的命令
 * @param {string} command package中的script命令
 * @return {string} 返回 serve|build|''
*/
const getSanCommand = command => {
    command = command.trim();
    const sanCommandReg = /san(?:-cli\/index\.js)?\s+(serve|build)(?:\s+--\S+(?:\s+\S+)?)*$/;
    const [, name] = command.match(sanCommandReg) || [];
    return name || '';
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
            <span class="task-name">{{taskInfo.name}}</span>
            <div class="task-config">
                <s-button type="primary" class="{{isRunning ? 'running' : 'stopped'}}" on-click="execute">
                    {{isRunning ? $t('task.stop') : $t('task.run')}}
                </s-button>
                <s-icon type="setting" on-click="showPromptForm" class="setting"></s-icon>
            </div>
        </div>

        <div class="task-main-views">
            <div class="task-bar">
                <span title="{{taskInfo.command}}" class="task-command">{{taskInfo.command}}</span>
                <div class="task-view-tabs" s-if="views.length">
                    <div on-click="setViewIndex(0)"
                        class="task-view-tab {{currentIndex === 0 ? 'active' : ''}}">
                        <span class="task-view-tab-label">{{$t('task.output')}}</span>
                    </div>
                    <div class="task-view-tab {{currentIndex === index + 1 ? 'active' : ''}}"
                        on-click="setViewIndex(index + 1)"
                        key="{{'k-' + index}}" s-for="view,index in views">
                        <span class="task-view-tab-label">{{$t(view.label)}}</span>
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
                    <div class="task-output-content-wrap">
                        <div class="task-output-content"></div>
                    </div>
                </div>

                <!-----自定义视图：第三方组件---->
                <fragment key="{{index}}" s-for="view,index in views">
                    <div class="task-view-content {{index + 1 !== currentIndex ? 'hidden' : ''}}">
                        <c-client-addon client-addon="{{view.component}}" data="{{clientAddonData}}" />
                    </div>
                </fragment>

                <s-modal title="{{$t('task.setting')}}"
                    width="800"
                    visible="{=promptsFormVisible=}"
                    on-ok="handlePromptFormOk"
                    on-cancel="handlePromptFormCancel"
                    confirmLoading="{{confirmLoading}}">
                    <div s-if="!taskInfo.prompts  || !taskInfo.prompts.length">
                        <div class="empty-tip">{{$t('task.emptyTip')}}</div>
                    </div>
                    <c-prompts-list s-else
                        s-ref="taskConfigForm"
                        hide-submit-btn="{{true}}"
                        prompts="{=taskInfo.prompts=}"
                        on-submit="saveTaskConfig"
                        on-valuechanged="onTaskConfigChange"
                    />
                </s-modal>
            </div>
        </div>
    </div>
    `;

    static components = {
        'c-prompts-list': PromptsList,
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

            prompts: [],

            sharedData: {}
        };
    }

    static computed = {
        clientAddonData() {
            const taskCommand = this.data.get('taskInfo.command');
            if (taskCommand) {
                const sanCommandType = getSanCommand(taskCommand);
                const sharedData = this.data.get('sharedData');
                return {sanCommandType, ...sharedData};
            }
        }
    };

    showPromptForm() {
        this.data.set('promptsFormVisible', true);
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
            // 0.编译结果详情：获取上一次san-cli编译结果进行展示
            const statsData = await this.$getSharedData(statsId) || {};
            this.data.set('sharedData', statsData);

            // 实时更新san-cli编译的最终结果
            this.$watchSharedData(statsId, data => {
                this.data.merge('sharedData', data);
            });

            const analyzerId = `${id}-stats-analyzer`;
            // 1.编译结果详情：获取上一次san-cli编译结果进行展示
            const analyzerData = await this.$getSharedData(analyzerId) || {};
            this.data.set('sharedData.analyzerData', analyzerData);

            // 实时更新san-cli编译的最终结果
            this.$watchSharedData(analyzerId, analyzerData => {
                this.data.set('sharedData.analyzerData', analyzerData);
            });

            // 2.编译进度：编译的百分比展示
            const progressId = `${id}-progress`;
            const progressData = await this.$getSharedData(progressId) || {};
            this.data.set('sharedData.progress', getProgress(progressData));
            this.$watchSharedData(progressId, data => {
                this.data.set('sharedData.progress', getProgress(data));
            });

            // 3.编译状态：任务仪表盘的状态，如：闲置、building
            const statusId = `${id}-status`;
            const statusData = await this.$getSharedData(statusId);
            this.data.set('sharedData.status', statusData);
            this.$watchSharedData(statusId, status => {
                this.data.set('sharedData.status', status);
            });

            // 4.编译状态：获取编译状体的tips
            const operationsId = `${id}-operations`;
            const operationsData = await this.$getSharedData(operationsId);
            this.data.set('sharedData.operations', operationsData);
            this.$watchSharedData(operationsId, data => {
                this.data.set('sharedData.operations', data);
            });

            if (sanCommandType === 'serve') {
                // 5. App的本地服务地址
                const urlId = `${id}-url`;
                const serveUrl = await this.$getSharedData(urlId);
                this.data.set('sharedData.serveUrl', serveUrl);
                this.$watchSharedData(`${id}-url`, serveUrl => {
                    this.data.set('sharedData.serveUrl', serveUrl);
                });
            }
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

    async initTerminal() {
        const res = await this.$apollo.query({query: UI_THEME});
        let terminalTheme;
        if (res && res.data && res.data.theme === 'darkmode') {
            terminalTheme = {
                foreground: '#fff',
                background: '#212226',
                cursor: '#fff',
                selection: '#e6f7ff'
            };
        } else {
            terminalTheme = {
                foreground: '#2c3e50',
                background: '#fff',
                cursor: '#fff',
                selection: '#e6f7ff'
            };
        }
        const terminal = new Terminal({
            theme: terminalTheme
        });
        terminal.loadAddon(new WebLinksAddon());
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

    async handlePromptFormOk(e) {
        this.data.set('promptsFormVisible', false);
        await this.$apollo.mutate({
            mutation: TASK_SAVE_PARAMETERS,
            variables: {
                id: this.data.get('taskInfo.id')
            }
        });
    }

    async handlePromptFormCancel(e) {
        this.data.set('promptsFormVisible', false);
        await this.$apollo.mutate({
            mutation: TASK_RESTORE_PARAMETERS,
            variables: {
                id: this.data.get('taskInfo.id')
            }
        });
    }

    async onTaskConfigChange({prompt, value}) {
        await this.$apollo.mutate({
            mutation: PROMPT_ANSWER,
            variables: {
                input: {
                    id: prompt.id,
                    value: JSON.stringify(value)
                }
            }
        });
    }
}
