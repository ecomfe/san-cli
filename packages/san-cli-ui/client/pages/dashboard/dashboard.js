/**
 * @file 仪表盘
 * @author zttonly
 */

import {Component} from 'san';
import WIDGETS from '@graphql/widget/widgets.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import WIDGET_REMOVE from '@graphql/widget/widgetRemove.gql';
import WIDGET_DEFINITION_FRAGMENT from '@graphql/widget/widgetDefinitionFragment.gql';
import Layout from '@components/layout';
import Widget from '@components/dashboard-widget';
import WidgetList from '@components/dashboard-widget/widget-list';
import clientAddon from '@components/client-addon/client-addon-loader';
import {Link} from 'san-router';
import {Icon, Button, Input} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/input/style';
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
                <div slot="content" class="h1oh dashboard-content">
                    <div class="widgets">
                        <div class="inner">
                            <template s-for="widget in widgets">
                                <c-widget
                                    s-if="widget"
                                    widget="{=widget=}"
                                    custom="{=editing=}"
                                    loaded="{=scriptLoaded=}"
                                />
                            </template>
                        </div>
                    </div>
                    <c-widget-list visible="{=editing=}"/>
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
        }
    };
    initData() {
        return {
            editing: false,
            widgets: [],
            pageLoading: false,
            isReady: false,
            scriptLoaded: false
        };
    }

    attached() {
        this.init();
    }
    async init() {
        this.data.set('pageLoading', true);
        // init plugin todo: plugin初始化依赖集中到一处
        await this.$apollo.query({query: PLUGINS});
        this.data.set('isReady', true);
        let widgets = await this.$apollo.query({query: WIDGETS});
        if (widgets.data) {
            this.data.set('pageLoading', false);
            this.data.set('widgets', widgets.data.widgets);
        }
    }
    onScriptLoad() {
        this.data.set('scriptLoaded', true);
    }
    showCustom() {
        let editing = this.data.get('editing');
        this.data.set('editing', !editing);
    }
}
