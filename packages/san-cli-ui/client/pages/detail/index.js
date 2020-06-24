/**
 * @file 项目配置详情页面
 * @author zttonly
 */

import {Component} from 'san';
import {createApolloComponent} from '@lib/san-apollo';
import CWD from '@graphql/cwd/cwd.gql';
import Layout from '@components/layout';
import {Link} from 'san-router';
import Dashboard from '@components/dashboard';
import Configuration from '@components/configuration';
// import Task from '@components/task';
import NotFound from '@components/not-found';
import {Icon, Button, Spin} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class Detail extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="detail">
            <s-spin class="loading" spinning="{{pageLoading}}" size="large"/>
            <c-layout menu="{{menuData}}" nav="{=nav=}" title="{=headTitle=}">
                <template slot="right">
                    <s-button s-if="route.query.func === 'dashboard'"
                        icon="block"
                        type="primary"
                        on-click="customizeView"
                    >{{$t('detail.customBtnText')}}</s-button>
                    <div s-elif="route.query.func === 'configuration'">
                        configuration head
                    </div>
                    <div s-elif="route.query.func === 'task'">
                        tasks head
                    </div>
                </template>
                <div slot="content">
                    <c-dashboard s-if="route.query.func === 'dashboard'"></c-dashboard>
                   <c-configuration s-elif="route.query.func === 'configuration'"></c-configuration>
                    <c-task s-elif="route.query.func === 'task'"></c-task>
                    <c-not-found s-else></c-not-found>
                </div>
            </c-layout>
        </div>
    `;
    static components = {
        's-icon': Icon,
        'r-link': Link,
        's-button': Button,
        's-spin': Spin,
        'c-layout': Layout,
        'c-dashboard': Dashboard,
        'c-configuration': Configuration,
        // 'c-task': Task,
        'c-not-found': NotFound
    };
    static computed = {
        headTitle() {
            let func = this.data.get('route.query.func');
            let title = this.data.get('title');
            return title[func];
        }
    };
    initData() {
        return {
            cwd: '',
            pageLoading: false,
            menuData: [],
            nav: [],
            title: []
        };
    }


    async attached() {
        this.data.set('menuData', this.$t('detail.menu'));
        this.data.set('nav', [this.data.get('route.query.func')]);
        this.data.set('title', this.$t('detail.title'));
        // simple query demo
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
    }
    customizeView() {
    }
}
