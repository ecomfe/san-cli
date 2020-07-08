/**
 * @file 搜索依赖模态框的item
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon, Spin} from 'santd';
import './dependency-search-item.less';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependency-install.gql';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';

export default class DependenceSearchItem extends Component {
    static template = /* html */`
        <s-spin class="loading" size="large" spinning="{{spinning}}" tip="{{loadingTip}}">
            <div class="dependency-search-item" slot="content">
                <div class="pkg-nav-item">
                    <div class="pkg-icon">
                        <div style="background-image: url({{data.owner.avatar}})"></div>
                    </div>
                    <div class="pkg-name-wrap">
                        <div>
                            <span>{{data.name}}</span>
                            <span class="pkg-version">{{data.version}}</span>
                            <s-icon type="download"/><span>{{downloadAmount}}</span>
                        </div>
                        <div class="pkg-description">{{data.description}}</div>
                    </div>
                    <div class="pkg-install-button"></div>
                </div>
                <div class="pkg-btn-operate">
                    <s-button on-click="onCheck">{{$t('dependency.checkDetail')}}</s-button>
                    <s-button on-click="onInstallPlugin">{{$t('dependency.install')}}</s-button>
                </div>
            </div>
        </s-spin>
    `;

    static computed = {
        downloadAmount() {
            let data = this.data.get('data');
            return data.humanDownloadsLast30Days.toUpperCase();
        }
    }
    initData() {
        return {
            loadingTip: '',
            spinning: false
        };
    }
    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon,
        's-spin': Spin
    }
    // 设置加载显示的提示条
    async inited() {
        this.data.set('loadingTip', this.$t('dependency.installing'));
    }
    // 点击查看详情
    onCheck() {
        let data = this.data.get('data');
        window.open(data.repository.url);
    }
    // 点击安装
    async onInstallPlugin(e) {
        this.data.set('spinning', true);
        let data =  await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                id: this.data.get('data').name,
                type: this.data.get('installType')
            },
            update: async (cache, {data: {dependencyInstall}}) => {
                // 暂停加载状态
                this.data.set('spinning', false);
                let cacheData = await this.$apollo.query({query: DEPENDENCIES});
                cache.writeQuery({query: DEPENDENCIES, data: {cacheData}});
            }
        });
    }
}
