/**
 * @file 仪表盘
 * @author zttonly
 */

import {Component} from 'san';
import WIDGETS from '@graphql/widget/widgets.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import WIDGET_DEFINITIONS from '@graphql/widget/widgetDefinitions.gql';
import WIDGET_REMOVE from '@graphql/widget/widgetRemove.gql';
import WIDGET_ADD from '@graphql/widget/widgetAdd.gql';
import WIDGET_DEFINITION_FRAGMENT from '@graphql/widget/widgetDefinitionFragment.gql';
import Layout from '@components/layout';
import Widget from '@components/dashboard-widget';
import WidgetList from '@components/dashboard-widget/widget-list';
import clientAddon from '@components/client-addon/client-addon-loader';
import {Link} from 'san-router';
import {Icon, Button, Input, Empty} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/input/style';
import 'santd/es/empty/style';
import './dashboard.less';

export default class Dashboard extends Component {
    static template = /* html */`
        <div class="h1oh dashboard {{editing ? 'customizing' : ''}}">
            <c-layout menu="{{$t('menu')}}" 
                nav="{{['dashboard']}}" 
                title="{{$t('dashboard.title')}}"
                page-loading="{=pageLoading=}"
            >
                <template slot="right">
                    <s-button disabled="{{true}}">{{$t('dashboard.tools')}}</s-button>
                    <s-button type="primary" on-click="showCustom">
                        <template s-if="editing">
                            <s-icon type="check"></s-icon>{{$t('dashboard.operationOn')}}
                        </template>
                        <template s-else>
                            <s-icon type="edit"></s-icon>{{$t('dashboard.operationOff')}}
                        </template>
                    </s-button>
                </template>
                <div slot="content" class="h1oh dashboard-content {{widgets.length === 0 && !editing ? 'empty' : ''}}">
                    <s-empty s-if="widgets.length === 0 && !editing" />
                    <div s-else class="widgets">
                        <div class="inner">
                            <template s-for="widget in widgets">
                                <c-widget
                                    s-if="widget"
                                    widget="{=widget=}"
                                    custom="{=editing=}"
                                    loaded="{=scriptLoaded=}"
                                    on-updatewidgets="updateWidgets"
                                />
                            </template>
                        </div>
                    </div>
                    <c-widget-list visible="{=editing=}" definitions="{=definitions=}" on-close="showCustom"/>
                </div>
            </c-layout>
            <c-client-addon s-if="isReady" on-scriptloaded="onScriptLoad"/>
        </div>
    `;
    static components = {
        's-icon': Icon,
        'r-link': Link,
        's-button': Button,
        's-input-search': Input.Search,
        's-empty': Empty,
        'c-layout': Layout,
        'c-widget': Widget,
        'c-widget-list': WidgetList,
        'c-client-addon': clientAddon
    };
    static messages = {
        async ['Widget:remove'](arg) {
            const id = arg.value;
            // reset widget
            this.data.set('widgets', []);
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
                    this.init();
                }
            });
        },
        async ['Widget:add'](arg) {
            const id = arg.value;
            await this.$apollo.mutate({
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
                    this.init();
                }
            });
        }
    };
    initData() {
        return {
            editing: false,
            widgets: [],
            definitions: [],
            pageLoading: true,
            isReady: false,
            scriptLoaded: false
        };
    }
    async created() {
        // init plugin todo: plugin初始化依赖集中到一处
        await this.$apollo.query({query: PLUGINS});
        this.data.set('isReady', true);
    }
    attached() {
        this.init();
    }
    async init() {
        let widgets = await this.$apollo.query({query: WIDGETS});
        if (widgets.data) {
            this.data.set('pageLoading', false);
            this.data.set('widgets', widgets.data.widgets);
        }
        let definitions = await this.$apollo.query({query: WIDGET_DEFINITIONS});
        if (definitions.data) {
            this.data.set('definitions', definitions.data.widgetDefinitions);
        }
    }
    updateWidgets(e) {
        this.data.set('widgets', e);
    }
    onScriptLoad() {
        this.data.set('scriptLoaded', true);
    }
    showCustom() {
        let editing = this.data.get('editing');
        this.data.set('editing', !editing);
    }
}
