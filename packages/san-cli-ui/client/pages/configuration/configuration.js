/**
 * @file 项目配置页面
 * @author zttonly
 */

import {Component} from 'san';
import {createApolloComponent} from '@lib/san-apollo';
import CONFIGURATIONS from '@graphql/configuration/configurations.gql';
import CONFIGURATION from '@graphql/configuration/configuration.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import Layout from '@components/layout';
import ListItemInfo from '@components/list-item-info';
import ConfigDetail from '@components/config-detail';
import {Link} from 'san-router';
import {Icon, Button, Spin, Input, Grid} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import 'santd/es/input/style';
import 'santd/es/grid/style';
import './configuration.less';

export default class Configuration extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="config">
            <s-spin class="loading" spinning="{{pageLoading}}" size="large"/>
            <c-layout menu="{{$t('menu')}}" nav="{{['configuration']}}" title="{{$t('config.title')}}">
                <template slot="right">
                    <div>
                        configuration head
                    </div>
                </template>
                <s-row type="flex" slot="content" class="main-content">
                    <s-col span="6">
                        <div class="nav-list">
                            <div class="filter-input">
                                <s-input-search value="{=search=}" />
                            </div>
                            <div s-for="item in filterList"
                                class="list-item {{currentConfigId === item.id ? 'selected' : ''}}"
                                on-click="switchConfig(item.id)"
                            >
                                <img src="{{item.icon}}" class="item-logo"/>
                                <c-item-info
                                    name="{{item.name}}"
                                    description="{{$t(item.description)}}"
                                    selected="{{currentConfigId === item.id}}"
                                />
                            </div>
                        </div>
                    </s-col>
                    <s-col span="18">
                        <div class="nav-content {{currentConfigId && currentConfig ? 'slide' : ''}}">
                            <c-config-detail s-if="currentConfigId && currentConfig"
                                current-config-id="{=currentConfigId=}"
                                config="{=currentConfig=}"
                            />
                        </div>
                    </s-col>
                </s-row>
            </c-layout>
        </div>
    `;
    static components = {
        's-icon': Icon,
        'r-link': Link,
        's-button': Button,
        's-spin': Spin,
        's-input-search': Input.Search,
        's-col': Grid.Col,
        's-row': Grid.Row,
        'c-item-info': ListItemInfo,
        'c-layout': Layout,
        'c-config-detail': ConfigDetail
    };
    initData() {
        return {
            configurations: [],
            plugins: '',
            pageLoading: false,
            search: '',
            currentConfigId: '',
            currentConfig: null
        };
    }
    static computed = {
        filterList() {
            let configurations = this.data.get('configurations');
            let search = this.data.get('search');
            return search ? configurations.filter(item => item.name.toLowerCase().indexOf(search) >= 0)
                : configurations;
        }
    };

    attached() {
        this.init();
    }
    async init() {
        // init plugin
        let plugins = await this.$apollo.query({query: PLUGINS});
        if (plugins.data) {
            this.data.set('plugins', plugins.data.plugins);
        }
        // init config
        let configurations = await this.$apollo.query({query: CONFIGURATIONS});
        if (configurations.data) {
            this.data.set('configurations', configurations.data.configurations);
        }
    }
    async updateCurrentConfig() {
        let id = this.data.get('currentConfigId');
        let configuration = await this.$apollo.query({
            query: CONFIGURATION,
            variables: {id}
        });
        if (configuration.data) {
            console.log('set config', configuration.data.configuration);
            this.data.set('currentConfig', configuration.data.configuration);
        }
    }
    switchConfig(id) {
        if (id) {
            console.log(id);
            this.data.set('currentConfigId', id);
            this.updateCurrentConfig();
        }
    }
}
