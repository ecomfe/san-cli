/**
 * @file 任务详情
 */

import {
    Component
} from 'san';
import {
    Button,
    Tooltip,
    Spin,
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
import './index.less';

export default class TaskList extends Component {
    static template = /* html */ `
        <div class="task-content">
            <div class="task-head">
                <span class="task-name"><s-icon type="coffee" />taskName</span>
                <span class="task-command">task info</span>
            </div>

            <div class="task-config">
                <s-button type="primary" icon="caret-right">{{$t('task.run')}}</s-button>
                <s-button type="default" icon="setting">{{$t('task.setting')}}</s-button>
            </div>

            <div class="task-output">
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
                <div class="task-output-content"></div>
            </div>
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

    attached() {
        this.nextTick(() => {
            this.initTerminal();
            const c = 'Hi~';
            this.setContent(c);
            window.addEventListener('resize', () => {
                this.fitAddon.fit();
            });
        });
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
