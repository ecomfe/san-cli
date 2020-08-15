/**
 * @file 任务仪表盘中的依赖项模块
 * @author Lohoyo
 */

import {Component} from 'san';
import './module-list-temp.less';

export default class BuildStatus extends Component {
    static template = /* html */`
    <div class="module-list">
        <fragment s-for="item in moduletList">
            <span class="name">{{item.name}}</span><span class="size">{{item.size}}</span>
        </fragment>
    </div>
    `;
};
