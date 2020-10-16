/**
 * @file 页面入口
 */

import Component from '@lib/san-component';
import ConnectionStatus from '@components/connection-status';
import HeaderTitle from '@components/layout/header';
import Sidebar from '@components/layout/sidebar';
import ClientAddon from '@components/client-addon';
import DashboardHeader from './dashboard/header';
import DashboardContent from './dashboard/content';
import DependencyHeader from './dependency/header';
import DependencyContent from './dependency/content';
import PluginsHeader from './plugins/header';
import PluginsContent from './plugins/content';
import ConfigurationContent from './configuration/content';
import TaskContent from './task/content';
import ListHeader from './list/header';
import ListContent from './list/content';
import CreateHeader from './create/header';
import CreateContent from './create/content';
import ImportHeader from './import/header';
import ImportContent from './import/content';
import '@components/layout/layout.less';
import './app.less';

export default class App extends Component {
    static template = /* html */`
        <s-layout class="h1oh layout">
            <c-connection-status></c-connection-status>

            <s-layout-header class="page-header">
                <c-header-title title="{{$t(routeNav+ '.title')}}"></c-header-title>
                <div class="header-aside">
                    <c-dashboard-header
                        s-if="routeNav === 'dashboard'"
                    />
                    <c-dependency-header
                        s-else-if="routeNav === 'dependency'"
                    />
                    <c-plugins-header
                        s-else-if="routeNav === 'plugins'"
                    />
                    <c-list-header
                        s-else-if="routeNav === 'list'"
                    />
                    <c-create-header
                        s-else-if="routeNav === 'create'"
                    />
                    <c-import-header
                        s-else-if="routeNav === 'import'"
                    />
                </div>
            </s-layout-header>

            <s-layout class="page-content h1oh">
                <c-sidebar 
                    selectedMenu="{{routeNav || routeAddon}}"
                    s-if="
                        routeNav!=='list' 
                        && routeNav!=='create' 
                        && routeNav!=='import'
                    "
                />

                <s-layout-content class="page-content-main">
                    <s-spin s-if="pageLoading"
                        class="loading"
                        spinning="{=pageLoading=}"
                        size="large"
                    >
                        <s-icon slot="indicator" type="loading" style="font-size: 30px;" />
                    </s-spin>

                    <c-dashboard-content
                        s-if="routeNav === 'dashboard'"
                    />
                    <c-plugins-content
                        s-else-if="routeNav === 'plugins'"
                    />
                    <c-dependency-content
                        s-else-if="routeNav === 'dependency'"
                    />
                    <c-configuration-content
                        s-else-if="routeNav === 'configuration'"
                    />
                    <c-task-content
                        taskName="{{routeTask}}"
                        s-else-if="routeNav === 'task' || route.query.task"
                    />
                    <c-list-content
                        s-if="routeNav === 'list'"
                    />
                    <c-create-content
                        s-else-if="routeNav === 'create'"
                    />
                    <c-import-content
                        s-else-if="routeNav === 'import'"
                    />
                    <c-client-addon
                        s-else-if="routeAddon"
                        class="client-addon-view"
                        clientAddon="{{routeAddon}}"
                    />
                </s-layout-content>
            </s-layout>
        </s-layout>
    `;

    static components = {
        'c-connection-status': ConnectionStatus,
        'c-header-title': HeaderTitle,
        'c-sidebar': Sidebar,
        'c-list-header': ListHeader,
        'c-list-content': ListContent,
        'c-create-header': CreateHeader,
        'c-create-content': CreateContent,
        'c-import-header': ImportHeader,
        'c-import-content': ImportContent,
        'c-dashboard-header': DashboardHeader,
        'c-dashboard-content': DashboardContent,
        'c-plugins-header': PluginsHeader,
        'c-plugins-content': PluginsContent,
        'c-dependency-header': DependencyHeader,
        'c-dependency-content': DependencyContent,
        'c-configuration-content': ConfigurationContent,
        'c-task-content': TaskContent,
        'c-client-addon': ClientAddon
    };

    static computed = {
        routeNav() {
            const routePath = this.data.get('route.path');
            if (routePath === '/' || routePath === '/project') {
                // 默认项目列表页面为首页
                return 'list';
            }
            return this.data.get('route.query.nav');
        },
        routeTask() {
            return this.data.get('route.query.task');
        },
        routeAddon() {
            return this.data.get('route.query.addon');
        }
    };

    initData() {
        return {
            pageLoading: false
        };
    }
}
