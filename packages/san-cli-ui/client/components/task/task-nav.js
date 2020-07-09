/**
 * @file 任务列表
 * @author jinzhan
 */

import {Component} from 'san';
import {Icon} from 'santd';
import {router, Link} from 'san-router';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './task-nav.less';

export default class TaskNav extends Component {
    static template = /* html */`
        <div class="task-nav">
            <div class="task-nav-item {{task.name===queryName ? 'task-nav-item-current' : ''}}" s-for="task in tasks">
                <s-link to="{{'/' + routePath + '/' + task.name}}">
                    <div class="task-icon">
                        <img s-if="task.icon" src="{{task.icon}}" />
                        <s-icon s-else type="right-circle" />
                    </div>
                    <div class="flex-all task-info">
                        <div class="task-info-name">{{task.name}}</div>
                        <div class="task-info-description">{{task.description || task.command}}</div>
                    </div>
                </s-link>
            </div>
        </div>
    `;

    static components = {
        's-icon': Icon,
        's-link': Link
    };
};
