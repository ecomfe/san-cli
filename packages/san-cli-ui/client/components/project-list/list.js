/**
 * @file List组件
 * @author zttonly
 */

// 第一个例子：使用san-component
import Component from '@lib/san-component';

export default class ProjectList extends Component {
    static template = /* html */`
        <div class="list">
            <div
                class="list-item{{lastOpenProject === item.id ? ' last-clicked-item' : ''}}"
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
            loading: false
        };
    }

    openInEditor(item, index, e) {
        e.stopPropagation();
        this.fire('open', {item});
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
