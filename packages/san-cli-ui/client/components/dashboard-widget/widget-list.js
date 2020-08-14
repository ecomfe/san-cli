/**
 * @file 仪表盘小部件列表
 * @author zttonly
 */

import Component from '@lib/san-component';
import widgetItem from './widget-item';
import './widget-list.less';

export default class widgetList extends Component {

    static template = /* html */`
        <div s-if="realVisible"
            class="widget-list {{actived ? 'actived' : ''}} {{visible ? 'show' : 'hide'}}"
            on-transitionstart="onTransitionstart"
            on-transitionend="onTransitionend">
            <div class="title-bar flex-none">
                <s-icon type="file-add" />
                <div class="title">
                    {{$t('dashboard.widgetList.title')}}
                </div>
                <s-button
                    class="icon-button"
                    icon="close"
                    on-click="close"
                ></s-button>
            </div>

            <div class="toolbar flex-none">
                <s-input-search
                    placeholder="{{$t('dashboard.widgetList.searchPlaceholder')}}"
                    value="{=search=}"
                ></s-input-search>
            </div>
            <div class="widgets">
                <template s-for="definition in filterList">
                    <widget-item
                        s-if="definition.canAddMore"
                        definition="{=definition=}"
                    />
                </template>
            </div>
        </div>
    `;

    static components = {
        'widget-item': widgetItem
    }

    static computed = {
        realVisible() {
            const visible = this.data.get('visible');
            const isTransitionend = this.data.get('isTransitionend');
            return visible || isTransitionend;
        },
        filterList() {
            const search = this.data.get('search');
            const list = this.data.get('definitions');
            return search ? list.filter(item => item.title.indexOf(search) > -1) : list;
        }
    };

    initData() {
        return {
            visible: false,
            isTransitionend: false,
            actived: false,
            search: '',
            definitions: []
        };
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
}
