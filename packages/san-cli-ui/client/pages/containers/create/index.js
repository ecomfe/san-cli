/**
 * @file 项目创建容器组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';

export default class Create extends Component {

    static template = /* html */`
        <div class="project-create">
            创建新项目
        </div>
    `;

    initData() {
        return {
            title: 'San CLI',
            cwd: '~'
        };
    }

    attached() {

    }
}

