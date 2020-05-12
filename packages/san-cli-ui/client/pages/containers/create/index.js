/**
 * @file 项目创建容器组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {createApolloComponent, createApolloDataComponent} from '@lib/san-apollo';

export default class Create extends Component {

    static template = /* html */`
        <div class="project-create">
            创建新项目
            <button type="button" on-click="createProject" class="create">创建</button>
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

    createProject() {
        console.log('createProject...');
    }
}

