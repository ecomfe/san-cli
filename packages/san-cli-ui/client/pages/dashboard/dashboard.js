/**
 * @file 仪表盘
 * @author zttonly, Lohoyo
 */

import {Link} from 'san-router';
import Component from '@lib/san-component';
import Layout from '@components/layout';
import Dashboard from '@components/dashboard/dashboard';
import WidgetList from '@components/dashboard/widget-list';
import PLUGINS from '@graphql/plugin/plugins.gql';
import WIDGETS from '@graphql/widget/widgets.gql';
import WIDGET_DEFINITIONS from '@graphql/widget/widgetDefinitions.gql';
import WIDGET_REMOVE from '@graphql/widget/widgetRemove.gql';
import WIDGET_ADD from '@graphql/widget/widgetAdd.gql';
import WIDGET_DEFINITION_FRAGMENT from '@graphql/widget/widgetDefinitionFragment.gql';
import './dashboard.less';

export default class App extends Component {
    static template = /* html */`
        <div class="h1oh dashboard {{editing ? 'customizing' : ''}}">
            <c-layout menu="{{$t('menu')}}" 
                nav="{{['dashboard']}}" 
                title="{{$t('dashboard.title')}}"
                page-loading="{=pageLoading=}"
            >
                <template slot="right">
                    <s-button disabled="{{true}}">{{$t('dashboard.tools')}}</s-button>
                    <div on-click="showCustom" class="icon {{editing ? 'check-icon' : 'custom-icon'}}"></div>
                </template>
                <div slot="content" class="h1oh dashboard-content {{widgets.length === 0 && !editing ? 'empty' : ''}}">
                    <div class="widgets">
                        <s-empty s-if="widgets.length === 0 && !editing" />
                        <div s-else class="inner">
                            <template s-for="widget,index in widgets">
                                <c-dashboard
                                    s-if="widget"
                                    widget="{=widget=}"
                                    index="{{index}}"
                                    custom="{=editing=}"
                                    on-updatewidgets="updateWidgets"
                                />
                            </template>
                        </div>
                    </div>
                    <c-widget-list visible="{=editing=}" definitions="{=definitions=}" on-close="showCustom"/>
                </div>
            </c-layout>
        </div>
    `;
    static components = {
        'r-link': Link,
        'c-layout': Layout,
        'c-dashboard': Dashboard,
        'c-widget-list': WidgetList
    };
    static messages = {
        async ['Widget:remove'](arg) {
            const id = arg.value;
            await this.$apollo.mutate({
                mutation: WIDGET_REMOVE,
                variables: {id},
                update: (store, {data: {widgetRemove}}) => {
                    let {widgets} = store.readQuery({query: WIDGETS});
                    widgets = widgets.filter(w => w.id !== id);
                    store.writeQuery({query: WIDGETS, data: {widgets}});
                    store.writeFragment({
                        fragment: WIDGET_DEFINITION_FRAGMENT,
                        id: widgetRemove.definition.id,
                        data: widgetRemove.definition
                    });
                }
            });
            let widgets = this.data.get('widgets');
            let index = widgets.findIndex(w => w.id === id);
            this.data.splice('widgets', [index, 1]);
            this.init();
        },
        async ['Widget:add'](arg) {
            const id = arg.value;
            let res = await this.$apollo.mutate({
                mutation: WIDGET_ADD,
                variables: {
                    input: {
                        definitionId: id
                    }
                },
                update: (store, {data: {widgetAdd}}) => {
                    let {widgets} = store.readQuery({query: WIDGETS});
                    widgets = [...widgets, widgetAdd];
                    store.writeQuery({query: WIDGETS, data: {widgets}});
                    store.writeFragment({
                        fragment: WIDGET_DEFINITION_FRAGMENT,
                        id: widgetAdd.definition.id,
                        data: widgetAdd.definition
                    });
                }
            });
            this.data.push('widgets', res.data.widgetAdd);
            this.init();
        }
    };
    initData() {
        return {
            editing: false,
            widgets: [],
            definitions: [],
            pageLoading: true
        };
    }
    async attached() {
        // 重要：初始化 plugin必须先执行 todo: plugin初始化依赖集中到一处使用san-store
        await this.$apollo.query({query: PLUGINS});
        let widgets = await this.$apollo.query({query: WIDGETS});
        if (widgets.data) {
            this.data.set('pageLoading', false);
            this.data.set('widgets', [...widgets.data.widgets]);
        }
        this.init();
    }
    async init() {
        let definitions = await this.$apollo.query({query: WIDGET_DEFINITIONS});
        if (definitions.data) {
            this.data.set('definitions', [...definitions.data.widgetDefinitions]);
        }
    }
    updateWidgets(e) {
        this.data.set('widgets', e);
    }
    showCustom() {
        let editing = this.data.get('editing');
        this.data.set('editing', !editing);
    }
}
