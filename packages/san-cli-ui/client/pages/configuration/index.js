/**
 * @file 项目配置页面
 * @author zttonly
 */

import {Component} from 'san';
import {createApolloComponent} from '@lib/san-apollo';
import CONFIGURATIONS from '@graphql/configuration/configurations.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
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
            <c-layout menu="{{$t('menu')}}" nav="{{['configuration']}}" title="{=headTitle=}">
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
            configurations: '',
            plugins: '',
            pageLoading: false
        };
    }


    async attached() {
        // simple query demo
        let plugins = await this.$apollo.query({query: PLUGINS});
        if (plugins.data) {
            this.data.set('plugins', plugins.data.plugins);
        }
        let configurations = await this.$apollo.query({query: CONFIGURATIONS});
        if (configurations.data) {
            this.data.set('configurations', configurations.data.configurations);
        }
    }
}
