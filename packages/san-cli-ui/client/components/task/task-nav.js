/**
 * @file 任务列表
 * @author jinzhan
 */

import Component from '@lib/san-component';
import {Link} from 'san-router';
import avatars from '@lib/utils/avatars';
import './task-nav.less';

export default class TaskNav extends Component {
    static template = /* html */`
        <div class="task-nav">
            <div class="task-nav-item {{task.name===queryName ? 'task-nav-item-current' : ''}}" s-for="task in tasks">
                <r-link to="{{'/' + routePath + '/' + task.name}}">
                    <div class="task-icon">
                        <img s-if="task.icon" src="{{task.icon}}" />
                        <img s-else src="{{avatars(task.name)}}" />
                    </div>
                    <div class="task-info">
                        <div class="task-info-name">{{task.name}}</div>
                        <div class="task-info-description">{{task.description || task.command}}</div>
                    </div>
                </r-link>
            </div>
        </div>
    `;

    static components = {
        'r-link': Link
    };

    avatars(name) {
        return avatars(name, 'initials');
    }
};
