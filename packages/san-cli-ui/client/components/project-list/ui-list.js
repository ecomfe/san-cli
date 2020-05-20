/**
 * @file List组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {Button, Icon} from 'santd';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import './index.less';
export default class ProjectList extends Component {

    static template = /* html */`
        <div class="list">
            <div class="list-item" s-for="item,index in list">
                <s-button type="primary" on-click="favorite(item, index)">
                    <s-icon type="star" theme="{{item.favorite ? 'filled' : 'outlined'}}"></s-icon>
                </s-button>
                <div class="content">
                    <div class="name">{{item.name}}</div>
                    <div>{{item.path}}</div>
                </div>
                <s-button type="primary" on-click="open(item, index)">在编辑器中打开</s-button>
                <s-button type="primary" icon="form" on-click="edit(item, index)"></s-button>
                <s-button type="primary" icon="close" on-click="delete(item, index)"></s-button>
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
    open(item, index) {
        this.fire('open', {item, index});
    }
    edit(item, index) {
        this.fire('edit', {item, index});
    }
    delete(item, index) {
        this.fire('delete', {item, index});
    }
    favorite(item, index) {
        this.fire('favorite', {item, index});
    }
}
