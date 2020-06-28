/**
 * @file 项目配置页面
 * @author zttonly
 */

import {Component} from 'san';
import {createApolloComponent} from '@lib/san-apollo';
import CONFIGURATIONS from '@graphql/configuration/configurations.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import Layout from '@components/layout';
import ListItemInfo from '@components/list-item-info';
import {Link} from 'san-router';
import {Icon, Button, Spin, Menu, Input, Radio, Grid, Tooltip} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import 'santd/es/menu/style';
import 'santd/es/input/style';
import 'santd/es/radio/style';
import 'santd/es/grid/style';
import 'santd/es/tooltip/style';
import './index.less';

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
                                <s-input value="{{search}}" />
                            </div>
                            <div s-for="item,index in configurations"
                                class="list-item {{nav === index ? 'selected' : ''}}"
                                on-click="switchNav(index)"
                            >
                                <img src="{{item.icon}}" class="item-logo"/>
                                <c-item-info
                                    name="{{item.name}}"
                                    description="{{$t(item.description)}}"
                                    selected="{{nav === index}"
                                />
                            </div>
                        </div>
                    </s-col>
                    <s-col span="18">
                        <div s-if="configuration.tabs.length > 1" class="tabs">
                            <s-radiogroup on-change="handleSizeChange" name="size">
                                <s-radiobutton s-for="tab in configuration.tabs">{{tab.label}}</s-radiobutton>
                            </s-radiogroup>
                        </div>
                        <prompts-list
                            prompts="{=visiblePrompts=}"
                            on-answer="answerPrompt"
                        />
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
        's-menu': Menu,
        's-menuitem': Menu.Item,
        's-input': Input,
        's-radiogroup': Radio.Group,
        's-radiobutton': Radio.Button,
        's-tooltip': Tooltip,
        's-col': Grid.Col,
        's-row': Grid.Row,
        'c-item-info': ListItemInfo,
        'c-layout': Layout
    };
    initData() {
        return {
            configurations: '',
            plugins: '',
            pageLoading: false,
            search: '',
            nav: -1
        };
    }


    async attached() {
        // simple query demo
        let plugins = await this.$apollo.query({query: PLUGINS});
        if (plugins.data) {
            this.data.set('plugins', plugins.data.plugins);
        }
        let configurations = await this.$apollo.query({query: CONFIGURATIONS});
        console.log(configurations);
        if (configurations.data) {
            this.data.set('configurations', configurations.data.configurations);
        }
    }
    switchNav(index) {
        console.log(index);
        this.data.set('nav', index);
    }
}
