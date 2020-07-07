/**
 * @file 搜索依赖模态框的item
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon} from 'santd';
import './index.less';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependency-install.gql';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';

export default class DependenceSearchItem extends Component {
    static template = /* html */`
        <div class="dependency-search-item">
            <div class="container">
                <div class="image-wrap">
                    <div class="image" style="background-image: url({{data.owner.avatar}})"></div>
                </div>
                <div class="name-wrap">
                    <div>
                        <span>{{data.name}}</span>
                        <span class="version">{{data.version}}</span>
                        <s-icon type="download"/><span class="download">{{downloadAmount}}</span>
                    </div>
                    <div class="description">{{data.description}}</div>
                </div>
                <div class="button"></div>
            </div>
            <div class="operate">
                <s-button on-click="onCheck">{{$t('dependency.checkDetail')}}</s-button>
                <s-button on-click="onInstallPlugin">{{$t('dependency.install')}}</s-button>
            </div>
        </div>
    `;

    static computed = {
        downloadAmount() {
            let data = this.data.get('data');
            return data.humanDownloadsLast30Days.toUpperCase();
        }
    };
    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon
    }
    // 点击查看详情
    onCheck() {
        let data = this.data.get('data');
        window.open(data.repository.url);
    }
    // 点击安装
    async onInstallPlugin(e) {
        let data =  await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                id: this.data.get('data').name,
                type: this.data.get('installType')
            },
            update: async (cache, {data: {dependencyInstall}}) => {
                let cacheData = await this.$apollo.query({query: DEPENDENCIES});
                cache.writeQuery({query: DEPENDENCIES, data: {cacheData}});
            }
        });
    }
}