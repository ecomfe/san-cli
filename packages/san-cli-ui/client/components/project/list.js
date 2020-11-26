/**
 * @file List组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import avatars from '@lib/utils/avatars';
import './list.less';

export default class ProjectList extends Component {
    static template = /* html */`
        <div class="project-list">
            <div
                class="list-item{{lastOpenProject === item.id ? ' last-open-project' : ''}}"
                s-for="item, index in list"
                on-click="handleClick(item, index)">
                
                <div class="icon" style="background-image: url({{avatars(item.name)}})"></div>

                <div class="content">
                    <div class="name">{{item.name}}</div>
                    <div>{{item.path}}</div>
                </div>

                <s-tooltip
                    class="operation-btn-wrap"
                    title="{{item.favorite
                        ? $t('project.list.tooltip.cancelCollect')
                        : $t('project.list.tooltip.collect')}}">
                    <div
                        class="operation-btn star-icon {{item.favorite ? 'favorited' : ''}}"
                        on-click="favorite(item, index, $event)">
                    </div>
                </s-tooltip>

                <s-tooltip title="{{$t('project.list.tooltip.editor')}}" class="operation-btn-wrap">
                    <div class="operation-btn code-icon" on-click="openInEditor(item, index, $event)"></div>
                </s-tooltip>

                <s-tooltip title="{{$t('project.list.tooltip.rename')}}" class="operation-btn-wrap">
                    <div class="operation-btn edit-icon" on-click="edit(item, index, $event)"></div>
                </s-tooltip>

                <s-tooltip title="{{$t('project.list.tooltip.del')}}" class="operation-btn-wrap">
                    <div class="operation-btn close-icon" on-click="remove(item, index, $event)"></div>
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
