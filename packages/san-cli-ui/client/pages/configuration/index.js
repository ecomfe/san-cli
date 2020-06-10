/**
 * @file 项目配置页面
 * @author zttonly
 */

import {Component} from 'san';
import {createApolloComponent} from '@lib/san-apollo';
import CWD from '@graphql/cwd/cwd.gql';
import Layout from '@components/layout';
import {Link} from 'san-router';
import {Icon, Button, Spin} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class Configuration extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="config">
            <s-spin class="loading" spinning="{{pageLoading}}" size="large"/>
            <c-layout menu="{{menuData}}" nav="['configuration']" title="{=headTitle=}">
                <template slot="right">
                    <div>
                        configuration head
                    </div>
                </template>
                <div slot="content">
                    configuration content
                </div>
            </c-layout>
        </div>
    `;
    static components = {
        's-icon': Icon,
        'r-link': Link,
        's-button': Button,
        's-spin': Spin,
        'c-layout': Layout
    };
    initData() {
        return {
            cwd: '',
            pageLoading: false,
            menuData: [],
            title: []
        };
    }


    async attached() {
        this.data.set('menuData', this.$t('menu'));
        // simple query demo
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
    }
}
