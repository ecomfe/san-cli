/**
 * @file 任务详情
 */

import {Component} from 'san';
import {Button, Spin, Icon} from 'santd';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class TaskList extends Component {
    static template = /* html */`
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
                    <s-icon type="delete" />
                    <s-icon type="copy" />
                </div>
            </div>
        </div>
    `;

    static components = {
        's-icon': Icon,
        's-button': Button
    };

    initData() {
        return {
        };
    }

    attached() {
    }
}
