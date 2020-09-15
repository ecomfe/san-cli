/**
 * @file List组件
 * @author zttonly
 */

import Component from '@lib/san-component';
import avatars from '@lib/utils/avatars';
import './list.less';

export default class ProjectList extends Component {
    static template = /* html */`
        <div class="project-list">
            <div
                class="list-item{{lastOpenProject === item.id ? ' last-clicked-item' : ''}}"
                s-for="item, index in list"
                on-click="handleClick(item, index)">
                
                <div class="icon" style="background-image: url({{avatars(item.name)}})"></div>

                <div class="content">
                    <div class="name">{{item.name}}</div>
                    <div>{{item.path}}</div>
                </div>

                <s-tooltip class="operation-btn" 
                    title="{{item.favorite
                        ? $t('project.list.tooltip.cancelCollect')
                        : $t('project.list.tooltip.collect')}}">
                    <s-icon
                        type="star"
                        theme="{{item.favorite ? 'filled' : 'outlined'}}"
                        class="{{item.favorite ? 'yellow-star' : ''}}"
                        on-click="favorite(item, index, $event)">
                    </s-icon>
                </s-tooltip>

                <s-tooltip class="operation-btn" title="{{$t('project.list.tooltip.editor')}}">
                    <s-icon type="code" on-click="openInEditor(item, index, $event)"></s-icon>
                </s-tooltip>

                <s-tooltip class="operation-btn" title="{{$t('project.list.tooltip.rename')}}">
                    <s-icon type="edit" on-click="edit(item, index, $event)"></s-icon>
                </s-tooltip>

                <s-tooltip class="operation-btn" title="{{$t('project.list.tooltip.del')}}">
                    <s-icon type="close" on-click="remove(item, index, $event)"></s-icon>
                </s-tooltip> 
            </div>
        </div>
    `;

    avatars(name) {
        return avatars(name.charAt(0), 'initials');
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
