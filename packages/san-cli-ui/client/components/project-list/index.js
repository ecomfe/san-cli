/**
 * @file List组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import PROJECTS from '@graphql/project/projects.gql';
import {Button, Icon} from 'santd';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import './index.less';
export default class ProjectList extends Component {

    static template = /* html */`
        <div class="project-list">
            项目列表
            <div class="list">
                <div class="list-item" s-for="item,index in list">
                    <s-button on-click="favorite">
                        <s-icon type="star" theme="{{item.favorite ? 'filled' : 'outlined'}}"></s-icon>
                    </s-button>
                    <div>
                        <span>{{item.name}}</span>
                        <span>{{item.path}}</span>
                    </div>
                    <s-button on-click="edit(item, index)">在编辑器中打开</s-button>
                    <s-button icon="form" on-click="open(item, index)"></s-button>
                    <s-button icon="close" on-click="delete(item, index)"></s-button>
                </div>
            </div>
        </div>
    `;

    initData() {
        return {
            loading: false
        };
    }

    static components = {
        's-button': Button,
        's-icon': Icon
    }
    async attached() {
        let projects = await this.$apollo.query({query: PROJECTS});
        if (projects.data) {
            this.data.set('list', projects.data.projects);
        }
    }
    edit(item, index) {
        console.log('edit', item, index);
    }
    delete(item, index) {
        console.log('delete', item, index);
    }
    favorite() {
    }
}
