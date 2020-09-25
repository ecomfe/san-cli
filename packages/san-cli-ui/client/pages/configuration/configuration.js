/**
 * @file 项目配置页面
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import CONFIGURATIONS from '@graphql/configuration/configurations.gql';
import CONFIGURATION from '@graphql/configuration/configuration.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import Layout from '@components/layout';
import ListItemInfo from '@components/list-item-info';
import ConfigContent from '@components/config-content';
import {Link} from 'san-router';
import './configuration.less';
import taskIconColor from '@lib/utils/task-icon-color';

export default class Configuration extends Component {
    static template = /* html */`
        <div class="h1oh">
            <c-layout menu="{{$t('menu')}}"
                nav="{{['configuration']}}"
                title="{{$t('config.title')}}"
                page-loading="{=pageLoading=}"
            >
                <template slot="right">
                    <s-button disabled="{{true}}">
                        {{$t('config.tools')}}
                    </s-button>
                </template>
                <s-grid-row type="flex" slot="content" class="h1oh configuration">
                    <s-grid-col span="6" class="h1oh">
                        <div class="nav-list">
                            <div s-for="item in configurations"
                                class="list-item {{currentConfigId === item.id ? 'selected' : ''}}"
                                on-click="switchConfig(item.id)"
                            >
                                <img
                                    src="{{item.icon}}"
                                    class="item-logo"
                                    style="background-color: {{
                                        currentConfigId === item.id ? highlightColor(item.name) : '#999'
                                    }}"
                                />
                                <c-item-info
                                    name="{{item.name}}"
                                    description="{{$t(item.description)}}"
                                    selected="{{currentConfigId === item.id}}"
                                    nameColor="{{currentConfigId === item.id ? highlightColor(item.name) : '#999'}}"
                                />
                            </div>
                        </div>
                    </s-grid-col>
                    <s-grid-col span="18" class="h1oh">
                        <div class="nav-content {{currentConfigId && currentConfig ? 'slide' : ''}}">
                            <c-config-content
                                s-if="currentConfigId && currentConfig"
                                current-config-id="{=currentConfigId=}"
                                config="{=currentConfig=}"
                                on-refetch="updateCurrentConfig"
                            />
                        </div>
                    </s-grid-col>
                </s-grid-row>
            </c-layout>
        </div>
    `;
    static components = {
        'r-link': Link,
        'c-item-info': ListItemInfo,
        'c-layout': Layout,
        'c-config-content': ConfigContent
    };
    initData() {
        return {
            configurations: [],
            pageLoading: true,
            currentConfigId: '',
            currentConfig: null
        };
    }
    attached() {
        this.init();
    }
    async init() {
        // init plugin 依赖 todo: 优化整合到一起例如使用store
        await this.$apollo.query({query: PLUGINS});
        // init config
        let configurations = await this.$apollo.query({query: CONFIGURATIONS});
        if (configurations.data) {
            this.data.set('configurations', configurations.data.configurations);
        }
        this.data.set('pageLoading', false);
    }
    async updateCurrentConfig() {
        let id = this.data.get('currentConfigId');
        let configuration = await this.$apollo.query({
            query: CONFIGURATION,
            variables: {id}
        });
        if (configuration.data) {
            this.data.set('currentConfig', configuration.data.configuration);
        }
    }
    switchConfig(id) {
        if (id) {
            this.data.set('currentConfigId', id);
            this.updateCurrentConfig();
        }
    }
    highlightColor(taskName) {
        return taskIconColor(taskName);
    }
}
