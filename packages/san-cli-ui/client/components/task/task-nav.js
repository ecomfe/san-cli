/**
 * @file 任务列表
 * @author jinzhan, Lohoyo
 */

import Component from '@lib/san-component';
import taskIconColor from '@lib/utils/task-icon-color';
import './task-nav.less';

export default class TaskNav extends Component {
    static template = /* html */`
        <div class="task-nav">
            <div class="task-nav-item {{task.name === queryName ? 'task-nav-item-current' : ''}}" s-for="task in tasks">
                <s-router-link to="{{$t('nav.task.link') + '/' + task.name}}">
                    <div class="task-icon" style="color: {{task.name === queryName ? iconColor(task.name) : '#999'}}">
                        {{task.name[0] | upper}}
                    </div>
                    <div class="task-info">
                        <div class="task-info-name"
                            style="color: {{task.name === queryName ? iconColor(task.name) : '#999'}}">
                            {{task.name}}
                        </div>
                        <div class="task-info-description">{{$t(task.description) || task.command}}</div>
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
