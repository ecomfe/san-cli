/**
 * @file 任务列表
 * @author jinzhan
 */

import Component from '@lib/san-component';
import {Link} from 'san-router';
import avatars from '@lib/utils/avatars';
import './task-card.less';

export default class TaskNav extends Component {
    static template = /* html */`
        <div class="task-cards">
            <div class="task-card-item {{task.name===queryName ? 'task-nav-item-current' : ''}}" s-for="task in tasks">
                <div class="card-item">
                    <div class="card-heading">
                        <span class="card-avtar">
                            <img s-if="task.icon" src="{{task.icon}}" />
                            <img s-else src="{{avatars(task.name)}}" />
                        </span>
                        <div class="card-meta">
                            <div class="card-title">{{task.name}}</div>
                            <div class="card-subtitle">{{task.description || task.command}}</div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <r-link to="{{'/' + routePath + '/' + task.name}}">{{$t('enter')}}</r-link>
                    </div>
                </div>
            </div>
        </div>
    `;

    static components = {
        'r-link': Link
    };

    avatars(name) {
        return avatars(name, 'initials');
    }
}
