/**
 * @file 仪表盘
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import Dashboard from '@components/dashboard/dashboard';
import WidgetList from '@components/dashboard/widget-list';
import PLUGINS from '@graphql/plugin/plugins.gql';
import TASKS from '@graphql/task/tasks.gql';
import WIDGETS from '@graphql/widget/widgets.gql';
import WIDGET_DEFINITIONS from '@graphql/widget/widgetDefinitions.gql';
import WIDGET_REMOVE from '@graphql/widget/widgetRemove.gql';
import WIDGET_ADD from '@graphql/widget/widgetAdd.gql';
import WIDGET_DEFINITION_FRAGMENT from '@graphql/widget/widgetDefinitionFragment.gql';
import './content.less';

export default class App extends Component {
    static template = /* html */`
        <div class="h1oh dashboard-content {{editing ? 'customizing' : (!widgets.length ? 'empty' : '')}}">
            <div class="widgets {{isHideOtherWidgets ? 'details-widget' : ''}}">
                <div s-if="widgets.length === 0 && !editing && !pageLoading" class="empty-tip">
                    {{$t('dashboard.emptyTip')}}
                </div>
                <div s-else class="inner">
                    <template s-for="widget,index in widgets">
                        <c-dashboard
                            s-if="widget"
                            widget="{=widget=}"
                            index="{{index}}"
                            custom="{=editing=}"
                            grid-size="{=gridSize=}"
                            on-updatewidgets="updateWidgets"
                            on-hideOtherWidgets="hideOtherWidgets">
                        </c-dashboard>
                    </template>
                </div>
            </div>
            <c-widget-list
                visible="{=editing=}"
                definitions="{=definitions=}"
                s-if="definitions.length">
            </c-widget-list>
        </div>
    `;
    static components = {
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

    $events() {
        return {
            async toggleContentStatus(e) {
                this.data.set('editing', e);
                if (!e) {
                    // 调整位置
                    let widgets = await this.$apollo.query({query: WIDGETS});
                    this.updateWidgets(widgets.data.widgets);
                }
            }
        };
    }

    initData() {
        return {
            editing: false,
            widgets: [],
            gridSize: 200,
            definitions: [],
            pageLoading: true,
            isHideOtherWidgets: false
        };
    }

    async attached() {
        // 重要：初始化 plugin必须先执行 todo: plugin初始化依赖集中到一处使用san-store
        await this.$apollo.query({query: PLUGINS});
        await this.$apollo.query({query: TASKS});

        let widgets = await this.$apollo.query({query: WIDGETS});
        if (widgets.data) {
            this.data.set('pageLoading', false);
            this.data.set('widgets', [...widgets.data.widgets]);
        }
        this.init();
        this.onWindowResize();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    onWindowResize() {
        if (!this.el) {
            return;
        }
        const bc = this.el.getBoundingClientRect();
        // widget页面布局横向7个栅格
        this.data.set('gridSize', Math.floor(bc.width / 7));
    }
    detached() {
        window.removeEventListener('resize', this.onWindowResize);
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

    hideOtherWidgets(e) {
        this.data.set('isHideOtherWidgets', e);
    }
}
