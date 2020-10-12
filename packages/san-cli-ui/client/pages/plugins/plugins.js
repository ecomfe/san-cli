/**
 * @file 插件管理
 */

import Component from '@lib/san-component';
import fastq from 'fastq';
import Layout from '@components/layout';
import DependencyItem from '@components/dependency/dependency-item';
import DependencyModal from '@components/dependency/dependency-modal';
import DependencyFilter from '@components/dependency/dependency-filter';
import PkgSearchItem from '@components/dependency/pkg-search-item';
import DEPENDENCY_ITEM from '@graphql/dependency/dependencyItem.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import './plugins.less';

export default class Plugins extends Component {
    static template = /* html */`
        <c-layout
            nav="{{['plugins']}}"
            title="{{$t('plugins.title')}}"
            page-loading="{=pageLoading=}"
        >
            <template slot="right">
                <c-dependency-filter on-keywordChange="keywordChange" />
                <s-button type="primary" on-click="onModalShow">
                    {{$t('plugins.installPlugin')}} <s-icon type="plus"/>
                </s-button>
            </template>
            <div slot="content" class="plugins">
                <div class="pkg-body" s-if="plugins.length">
                    <h2>{{$t('plugins.subTitle')}}</h2>
                    <c-dependency-item s-for="item in plugins" item="{{item}}" hideDeleteBtn></c-dependency-item>
                </div>
                <div s-else class="empty-tip">{{$t('plugins.emptyTip')}}</div>
                <c-dependency-modal on-cancel="onModalClose" visible="{{addPlugin}}">
                    <template slot="content">
                        <s-spin spinning="{{loading}}" class="plugin-item">
                            <c-pkg-search-item slot="content"
                                keyword="{{'san-cli-plugin'}}"
                                load-meta="{{true}}"
                                on-loading="onLoadingChange"/>
                        </s-spin>
                    </template>
                </c-dependency-modal>
            </div>
        </c-layout>
    `;

    static components = {
        'c-layout': Layout,
        'c-dependency-item': DependencyItem,
        'c-dependency-filter': DependencyFilter,
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
    initData() {
        return {
            pluginList: [],
            pageLoading: true,
            addPlugin: false,
            searchKey: '',
            loading: false
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
        const queue = fastq(this, this.getDependencyItem, concurrency);
        plugins.forEach(({id}, index) => {
            queue.push({id, index}, (err, data) => {
                if (err) {
                    throw err;
                }
                this.data.set(`pluginList[${index}].detail`, data);
            });
        });
    }

    async getDependencyItem({id, index}, callback) {
        const mutation = await this.$apollo.mutate({
            mutation: DEPENDENCY_ITEM,
            variables: {id}
        });

        const dependencyItem = mutation.data && mutation.data.dependencyItem;
        if (dependencyItem) {
            callback && callback(null, dependencyItem);
        }
    }
    keywordChange(key) {
        key = key.trim();
        this.data.set('searchKey', key);
    }
    onLoadingChange(e) {
        this.data.set('loading', e);
    }

    onModalClose() {
        this.data.set('addPlugin', false);
        this.init();
    }

    onModalShow() {
        this.data.set('addPlugin', true);
    }
}
