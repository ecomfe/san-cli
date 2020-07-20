/**
 * @file List组件
 * @author zttonly
 */

import {Component} from 'san';
import {Button, Icon, Tooltip} from 'santd';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import 'santd/es/tooltip/style';

export default class ProjectList extends Component {
    static template = /* html */`
        <div class="list">
            <div
                class="list-item{{lastOpenedProject === item.id ? ' last-clicked-item' : ''}}"
                s-for="item, index in list"
                on-click="handleClick(item, index)">
                <s-tooltip 
                    title="{{item.favorite
                        ? $t('project.list.tooltip.cancelCollect')
                        : $t('project.list.tooltip.collect')}}"
                    >
                    <s-button type="primary" on-click="favorite(item, index, $event)">
                        <s-icon type="star" theme="{{item.favorite ? 'filled' : 'outlined'}}"></s-icon>
                    </s-button>
                </s-tooltip>

                <div class="content">
                    <div class="name">{{item.name}}</div>
                    <div>{{item.path}}</div>
                </div>

                <s-tooltip title="{{$t('project.list.tooltip.editor')}}">
                    <s-button type="primary" icon="codepen" on-click="openInEditor(item, index, $event)"></s-button>
                </s-tooltip>

                <s-tooltip title="{{$t('project.list.tooltip.rename')}}">
                    <s-button type="primary" icon="form" on-click="edit(item, index, $event)"></s-button>
                </s-tooltip>

                <s-tooltip title="{{$t('project.list.tooltip.del')}}">
                    <s-button type="primary" icon="close" on-click="remove(item, index, $event)"></s-button>
                </s-tooltip> 
            </div>
        </div>
    `;

    initData() {
        return {
            loading: false,
            lastOpenedProject: JSON.parse(localStorage.getItem('recentProjects'))[0]
        };
    }

    static components = {
        's-button': Button,
        's-icon': Icon,
        's-tooltip': Tooltip
    }

    openInEditor(item, index, e) {
        e.stopPropagation();
        this.fire('open', {item, index});
    }

    edit(item, index, e) {
        e.stopPropagation();
        this.fire('edit', {item, index});
    }

    remove(item, index, e) {
        e.stopPropagation();
        this.fire('remove', {item, index});
    }

    favorite(item, index, e) {
        e.stopPropagation();
        this.fire('favorite', {item, index});
    }
    handleClick(item, index) {
        this.fire('itemclick', {item, index});
    }
}
