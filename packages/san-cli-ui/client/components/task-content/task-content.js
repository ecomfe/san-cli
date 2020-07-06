/**
 * @file 任务详情
 */

import {
    Component
} from 'san';
import {
    Button,
    Tooltip,
    Icon
} from 'santd';
import {
    Terminal
} from 'xterm';
import {
    FitAddon
} from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import 'santd/es/tooltip/style';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import TASK_RUN from '@graphql/task/taskRun.gql';
import TASK_LOG_ADDED from '@graphql/task/taskLogAdded.gql';
import TASK_LOGS from '@graphql/task/taskLogs.gql';
import './task-content.less';

/**
 * 组件props
 *
 * @param {Object} taskInfo 当前的任务信息
 */
export default class TaskContent extends Component {
    static template = /* html */ `
        <div class="task-content">
            <div class="task-head">
                <span class="task-name"><s-icon type="file-text" />{{taskInfo.name}}</span>
                <span class="task-command">{{taskInfo.command}}</span>
            </div>

            <div class="task-config">
                <s-button type="primary" icon="caret-right" on-click="runTask">{{$t('task.run')}}</s-button>
                <s-button type="default" icon="setting">{{$t('task.setting')}}</s-button>
            </div>

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
    `;

    static components = {
        's-icon': Icon,
        's-button': Button,
        's-tooltip': Tooltip
    };

    initData() {
        return {};
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
            // 1. 清除 -> 界面上的log
            this.clear();

            // 2. 读取 -> 历史记录中的log
            this.setConsoleLogLast(name);

            // 3. 订阅 -> 命令产生的log
            this.subscribeConsoleLog(name);
        });
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
        // console.log({logs});
        if (taskLogs.logs) {
            const logsText = logs.map(log => log.text).join('\n');
            this.setContent(logsText);
        }
    }

    subscribeConsoleLog(id) {
        // 避免重复订阅
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.subscription = this.$apollo.subscribe({
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

    async runTask() {
        const mutation = await this.$apollo.mutate({
            mutation: TASK_RUN,
            variables: {
                id: this.data.get('taskInfo.name')
            }
        });
        const taskRun = mutation.data.taskRun;
        console.log({taskRun});
        // TODO: 增加任务运行的状态
    }

    initTerminal() {
        const theme = {
            foreground: '#2c3e50',
            background: '#fff',
            cursor: '#fff',
            selection: '#e6f7ff',
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
     * @param {string} value
     * @param {boolean} ln 是否换行
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
};
