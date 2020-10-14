/**
 * @file 页面入口
 */

import Component from '@lib/san-component';
import ConnectionStatus from '@components/connection-status';
import HeaderTitle from '@components/layout/header';
import Sidebar from '@components/layout/sidebar';
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
                <c-header-title title="{{$t(route.query.nav + '.title')}}"></c-header-title>
                <div class="head-right">
                    <c-dashboard-header
                        s-if="route.query.nav === 'dashboard'"
                    />
                    <c-dependency-header
                        s-else-if="route.query.nav === 'dependency'"
                    />
                    <c-plugins-header
                        s-else-if="route.query.nav === 'plugins'"
                    />
                    <c-list-header
                        s-else-if="route.query.nav === 'list'"
                    />
                    <c-create-header
                        s-else-if="route.query.nav === 'create'"
                    />
                    <c-import-header
                        s-else-if="route.query.nav === 'import'"
                    />
                </div>
            </s-layout-header>

            <s-layout class="page-content h1oh">
                <c-sidebar 
                    nav="{{routeNav}}" 
                    s-if="route.query.nav !=='list' && route.query.nav !=='create' && route.query.nav !=='import'"
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
                        s-if="route.query.nav === 'dashboard'"
                    />
                    <c-plugins-content
                        s-else-if="route.query.nav === 'plugins'"
                    />
                    <c-dependency-content
                        s-else-if="route.query.nav === 'dependency'"
                    />
                    <c-configuration-content
                        s-else-if="route.query.nav === 'configuration'"
                    />
                    <c-task-content
                        taskName="{{routeTask}}"
                        s-else-if="route.query.nav === 'task' || route.query.task"
                    />
                    <c-list-content
                        s-if="route.query.nav === 'list'"
                    />
                    <c-create-content
                        s-else-if="route.query.nav === 'create'"
                    />
                    <c-import-content
                        s-else-if="route.query.nav === 'import'"
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
        'c-task-content': TaskContent
    };

    static computed = {
        routeNav() {
            return this.data.get('route.query.nav');
        },
        routeTask() {
            return this.data.get('route.query.task');
        }
    };

    initData() {
        return {
            pageLoading: false
        };
    }
}
