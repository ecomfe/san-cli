/**
 * @file List组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {Button, Icon, Tooltip} from 'santd';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import 'santd/es/tooltip/style';
import './index.less';
export default class ProjectList extends Component {

    static template = /* html */`
        <div class="list">
            <div class="list-item" s-for="item,index in list">
                <s-tooltip 
                title="{{$t(item.favorite ? 'project.tooltip.cancelCollect' : 'project.tooltip.collect')}}">
                    <s-button type="primary" on-click="favorite(item, index)">
                        <s-icon type="star" theme="{{item.favorite ? 'filled' : 'outlined'}}"></s-icon>
                    </s-button>
                </s-tooltip>

                <div class="content">
                    <div class="name">{{item.name}}</div>
                    <div>{{item.path}}</div>
                </div>

                <s-tooltip title="{{$t('project.tooltip.editor')}}">
                    <s-button type="primary" icon="codepen" on-click="open(item, index)"></s-button>
                </s-tooltip>

                <s-tooltip title="{{$t('project.tooltip.rename')}}">
                    <s-button type="primary" icon="form" on-click="edit(item, index)"></s-button>
                </s-tooltip>

                <s-tooltip title="{{$t('project.tooltip.del')}}">
                    <s-button type="primary" icon="close" on-click="delete(item, index)"></s-button>
                </s-tooltip> 
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
        's-icon': Icon,
        's-tooltip': Tooltip
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
