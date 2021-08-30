/**
 * @file 任务列表
 * @author jinzhan, Lohoyo
 */

import Component from '@lib/san-component';
import taskIconColor from '@lib/utils/task-icon-color';
import './task-card.less';

export default class TaskNav extends Component {
    static template = /* html */`
        <div class="task-cards">
            <div
                class="task-card-item {{task.name === queryName ? 'task-nav-item-current' : ''}}"
                s-for="task in tasks">
                <s-router-link to="{{$t('nav.task.link') + '/' + task.name}}" class="card-item">
                    <div class="card-icon" style="color: {{iconColor(task.name)}}">{{task.name[0] | upper}}</div>
                    <div class="card-meta">
                        <div class="card-title" style="color: {{iconColor(task.name)}}">{{task.name}}</div>
                        <div class="card-subtitle">{{$t(task.description) || task.command}}</div>
                    </div>
                </s-router-link>
            </div>
        </div>
    `;

    static filters = {
        upper(str) {
            return str.toUpperCase();
        }
    };

    iconColor(taskName) {
        return taskIconColor(taskName);
    }
}
