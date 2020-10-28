/**
 * @file 仪表盘-增加部件详情组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import ListItemInfo from '@components/list-item-info';
import './widget.less';

export default class WidgetItem extends Component {

    static template = /* html */`
        <div class="widget-item" s-if="definition">
           <div
                class="info"
                on-click="open"
            >
                <s-icon type="{{definition.icon}}" class="item-icon"/>
                <c-item-info
                    name="{{$t(definition.title)}}"
                    description="{{$t(definition.description)}}"
                    link="{{definition.link}}"
                />
            </div>

            <div class="actions">
                <s-button
                    class="icon-button"
                    type="primary"
                    icon="plus"
                    on-click="add"
                    shape="circle"
                ></s-button>
            </div>
            <s-modal 
                s-if="showModal"
                width="580"
                title="{{$t('dashboard.widgetAddItem.details.title')}}"
                visible="{=showModal=}"
                okText="确定"
                on-ok="close"
                on-cancel="close"
            >
                <div class="custom-body">
                    <div class="details">
                        <s-icon type="{{definition.icon}}"  class="item-icon"/>
                        <c-item-info
                            name="{{$t(definition.title)}}"
                            description="{{$t(definition.description)}}"
                        />
                    </div>

                    <div s-if="definition.longDescription" class="details">
                        <div class="description"
                            s-html="{{$t(definition.longDescription)}}"
                        ></div>
                    </div>

                    <div class="instances">
                        {{$t('dashboard.widgetAddItem.details.maxInstances')}} {{definition.count}}/{{
                            definition.maxCount == null 
                            ? $t('dashboard.widgetAddItem.details.unlimited')
                            : definition.maxCount}}
                    </div>
                </div>

                <!-- div slot="footer" class="actions">
                    <s-button
                        s-if="definition.link"
                        href="{{definition.link}}"
                        icon="export"
                    >{{$t('list-item-info.more')}}</s-button>

                    <s-button
                        type="primary"
                        icon="plus"
                        on-click="add"
                    >{{$t('dashboard.widgetAddItem.add')}}</s-button>
                </div -->
            </s-modal>
        </div>
    `;

    static components = {
        'c-item-info': ListItemInfo
    };
    initData() {
        return {
            definition: null,
            showModal: false,
            total: 1,
            count: 0
        };
    }
    add() {
        const id = this.data.get('definition.id');
        this.dispatch('Widget:add', id);
    }
    remove() {
        const id = this.data.get('definition.id');
        this.dispatch('Widget:remove', id);
    }
    close() {
        this.data.set('showModal', false);
    }
    open() {
        this.data.set('showModal', true);
    }
}
