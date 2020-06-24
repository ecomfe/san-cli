/**
 * @file 任务列表
 */

import {Component} from 'san';
import {Button, Spin, Icon} from 'santd';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class TaskList extends Component {
    static template = /* html */`
        <div class="task-nav">
            <div class="task-nav-item" s-for="task in tasks">
                <div class="task-icon">
                    <img s-if="task.icon" src="{{task.icon}}" s-src="https://ecomfe.github.io/santd/66dd6d595227d5da65521027e42b0664.png" />
                    <s-icon s-else type="right-circle" />
                </div>
                <div class="task-info">
                    <div class="task-info-name">{{task.name}}</div>
                    <div class="task-info-description">{{task.description || task.command}}</div>
                </div>
            </div>
        </div>
    `;

    static components = {
        's-icon': Icon
    };

    initData() {
        return {
        };
    }

    attached() {
    }
}
