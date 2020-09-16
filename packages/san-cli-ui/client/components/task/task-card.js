/**
 * @file 任务列表
 * @author jinzhan, Lohoyo
 */

import Component from '@lib/san-component';
import {Link} from 'san-router';
import taskIconColor from '@lib/utils/task-icon-color';
import './task-card.less';

export default class TaskNav extends Component {
    static template = /* html */`
        <div class="task-cards">
            <div class="task-card-item {{task.name===queryName ? 'task-nav-item-current' : ''}}" s-for="task in tasks">
                <r-link to="{{'/' + routePath + '/' + task.name}}" class="card-item">
                    <div class="card-icon" style="color: {{iconColor(task.name)}}">{{task.name[0] | upper}}</div>
                    <div class="card-meta">
                        <div class="card-title" style="color: {{iconColor(task.name)}}">{{task.name}}</div>
                        <div class="card-subtitle">{{$t(task.description) || task.command}}</div>
                    </div>
                </r-link>
            </div>
        </div>
    `;

    static components = {
        'r-link': Link
    };

    static filters = {
        upper(str) {
            return str.toUpperCase();
        }
    };

    iconColor(taskName) {
        return taskIconColor(taskName);
    }
}
