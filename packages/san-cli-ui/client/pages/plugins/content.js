/**
 * @file 插件管理
 */

import Component from '@lib/san-component';
import fastq from 'fastq';
import DependencyItem from '@components/dependency/dependency-item';
import DependencyModal from '@components/dependency/dependency-modal';
import PkgSearchItem from '@components/dependency/pkg-search-item';
import PLUGIN_ITEM from '@graphql/plugin/pluginItem.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import './content.less';

export default class Plugins extends Component {
    static template = /* html */`
        <div class="plugins-list">
            <div class="pkg-body" s-if="plugins.length">
                <h2 class="com-sub-title">{{$t('plugins.subTitle')}}</h2>
                <c-dependency-item
                    s-for="item in plugins"
                    item="{{item}}"
                    on-updatePkgList="init"
                    type="plugins">
                </c-dependency-item>
            </div>
            <div s-else-if="!pageLoading" class="empty-tip">{{$t('plugins.emptyTip')}}</div>
            <c-dependency-modal on-cancel="onModalClose" visible="{{addPlugin}}">
                <s-spin spinning="{{loading}}" class="plugin-item" slot="content">
                    <fragment slot="content">
                        <s-radio-group
                            name="radiogroup"
                            defaultValue="{{radioValue}}"
                            on-change="onRadioChange"
                            class="pkg-radio">
                            <s-radio-button value="plugin">
                                <s-tooltip title="{{$t('plugins.pluginTip')}}">{{$t('plugins.plugin')}}</s-tooltip>
                            </s-radio-button>
                            <s-radio-button value="widget">
                                <s-tooltip title="{{$t('plugins.widgetTip')}}">{{$t('plugins.widget')}}</s-tooltip>
                            </s-radio-button>
                        </s-radio-group>
                        <c-pkg-search-item
                            keyword="{{radioValue === 'plugin' ? 'san-cli-plugin' : 'san-cli-ui-widget'}}"
                            type="plugins"
                            on-loading="onLoadingChange"
                            loading="{{loading}}"
                            installedPackages="{{plugins}}">
                        </c-pkg-search-item>
                    </fragment>
                </s-spin>
            </c-dependency-modal>
        </div>
    `;

    static components = {
        'c-dependency-item': DependencyItem,
        'c-dependency-modal': DependencyModal,
        'c-pkg-search-item': PkgSearchItem
    };

    static computed = {
        plugins() {
            return this.data.get('pluginList')
                .filter(item => {
                    const searchKey = this.data.get('searchKey');
                    return !searchKey || ~item.id.indexOf(searchKey);
                });
        }
    };

    $events() {
        return {
            keywordChange(data) {
                this.data.set('searchKey', data);
            },
            showModal(data) {
                this.data.set('addPlugin', data);
            },
            refreshPackages() {
                this.init();
            }
        };
    }

    initData() {
        return {
            pluginList: [],
            pageLoading: true,
            addPlugin: false,
            searchKey: '',
            loading: true,
            radioValue: 'plugin'
        };
    }

    attached() {
        this.init();
    }

    async init() {
        const query = await this.$apollo.query({query: PLUGINS});
        const plugins = query.data ? query.data.plugins : [];
        this.data.set('pluginList', plugins);
        this.data.set('pageLoading', false);
        // 使用队列来优化性能，并发量3
        const concurrency = 3;
        const queue = fastq(this, this.getPluginItem, concurrency);
        plugins.forEach(({id}, index) => {
            queue.push({id, index}, (err, data) => {
                if (err) {
                    throw err;
                }
                this.data.set(`pluginList[${index}].detail`, data);
            });
        });
    }

    async getPluginItem({id, index}, callback) {
        const mutation = await this.$apollo.mutate({
            mutation: PLUGIN_ITEM,
            variables: {id}
        });

        const pluginItem = mutation.data && mutation.data.pluginItem;
        if (pluginItem) {
            callback && callback(null, pluginItem);
        }
    }

    onLoadingChange(e) {
        this.data.set('loading', e);
    }

    onModalClose() {
        this.data.set('addPlugin', false);
    }

    onRadioChange(event) {
        this.data.set('radioValue', event.target.value);
    }
}
