/**
 * @file 仪表盘小部件列表
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import widget from './widget';
import './widget-list.less';

/**
 * 组件props
 *
 * @param {Array} definitions 部件列表
 * @param {Boolean} visible 部件列表是否可见
 */
export default class widgetList extends Component {

    static template = /* html */`
        <div
            s-if="realVisible"
            class="widget-list {{actived ? 'actived' : ''}} {{visible ? 'show' : 'hide'}}"
            on-transitionstart="onTransitionstart"
            on-transitionend="onTransitionend">
            <div class="widget-list-content">
                <div class="title-bar flex-none">
                    <div class="title">
                        {{$t('dashboard.widgetList.title')}}
                    </div>
                    <s-button
                        class="icon-button"
                        icon="close"
                        on-click="close">
                    </s-button>
                </div>

                <div class="toolbar flex-none">
                    <s-input-search
                        placeholder="{{$t('dashboard.widgetList.searchPlaceholder')}}"
                        on-change="filterList">
                    </s-input-search>
                </div>
                <div class="widgets">
                    <fragment s-for="definition in searchResult">
                        <c-widget s-if="definition.canAddMore" definition="{=definition=}"></c-widget>
                    </fragment>
                </div>
            </div>
        </div>
    `;

    static components = {
        'c-widget': widget
    }

    static computed = {
        realVisible() {
            const visible = this.data.get('visible');
            const isTransitionend = this.data.get('isTransitionend');
            return visible || isTransitionend;
        }
    };

    initData() {
        return {
            isTransitionend: false,
            actived: false
        };
    }

    inited() {
        this.filterList('');
    }

    onTransitionstart() {
        this.data.set('isTransitionend', false);
    }

    onTransitionend() {
        const visible = this.data.get('visible');
        this.data.set('actived', visible);
        this.data.set('isTransitionend', true);
    }

    close() {
        this.fire('close');
    }

    filterList(searchInput) {
        const list = this.data.get('definitions');
        this.data.set('searchResult', list.filter(item => this.$t(item.title)
            && this.$t(item.title).indexOf(searchInput) > -1));
    }
}
