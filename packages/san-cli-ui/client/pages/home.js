/**
 * @file 页面入口
 */

import Component from '@lib/san-component';
import ConnectionStatus from '@components/connection-status';
import HeaderTitle from '@components/layout/header';
import MoreBtn from '@components/layout/more-btn';
import ListHeader from './list/header';
import ListContent from './list/content';
import CreateHeader from './create/header';
import CreateContent from './create/content';
import ImportHeader from './import/header';
import ImportContent from './import/content';

export default class App extends Component {
    static template = /* html */`
        <s-layout class="h1oh layout">
            <c-connection-status></c-connection-status>

            <s-layout-header class="page-header">
                <c-header-title title="{{$t(routeNav+ '.title')}}"></c-header-title>
                <div class="header-aside">
                    <c-list-header
                        s-if="routeNav === 'list'"
                    />
                    <c-create-header
                        s-else-if="routeNav === 'create'"
                    />
                    <c-import-header
                        s-else-if="routeNav === 'import'"
                    />
                    <c-more-btn></c-more-btn>
                </div>
            </s-layout-header>

            <s-layout class="page-content h1oh">
                <s-layout-content class="page-content-main">
                    <s-spin s-if="pageLoading"
                        class="loading"
                        spinning="{=pageLoading=}"
                        size="large"
                    >
                        <s-icon slot="indicator" type="loading" style="font-size: 30px;" />
                    </s-spin>

                    <c-list-content
                        s-if="routeNav === 'list'"
                    />
                    <c-create-content
                        s-else-if="routeNav === 'create'"
                    />
                    <c-import-content
                        s-else-if="routeNav === 'import'"
                    />
                </s-layout-content>
            </s-layout>
        </s-layout>
    `;

    static components = {
        'c-connection-status': ConnectionStatus,
        'c-header-title': HeaderTitle,
        'c-list-header': ListHeader,
        'c-list-content': ListContent,
        'c-create-header': CreateHeader,
        'c-create-content': CreateContent,
        'c-import-header': ImportHeader,
        'c-import-content': ImportContent,
        'c-more-btn': MoreBtn
    };

    static computed = {
        routeNav() {
            const routePath = this.data.get('route.path');
            if (routePath === '/' || routePath === '/home') {
                // 默认项目列表页面为首页
                return 'list';
            }
            return this.data.get('route.query.1');
        }
    };

    initData() {
        return {
            pageLoading: false
        };
    }
}
