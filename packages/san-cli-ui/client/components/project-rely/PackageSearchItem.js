/**
 * @file PackageSearchItem组件
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon} from 'santd';
import './index.less';
// import DEPENDENCY_INSTALL from '@/graphql/dependency/dependencyInstall.gql'
// import DEPENDENCIES from '@/graphql/dependency/dependencies.gql';

export default class PackageSearchItem extends Component {
    static template = /* html */`
        <div class="package-search-item">
            <div class="container">
                <div class="image-wrap">
                    <div class="image" style="background-image: url({{data.owner.avatar}})"></div>
                </div>
                <div class="name-wrap">
                    <div>
                        <span >{{data.name}}</span>
                        <span class="version">{{data.version}}</span>
                        <s-icon type="download"/><span class="download">{{downloadAmount}}</span>
                    </div>
                    <div class="description">{{data.description}}</div>
                </div>
                <div class="button"></div>
            </div>
            <div class="operate">
                <s-button on-click="onCheck">查看详情</s-button>
                <s-button on-click="onInstallPlugin">安装</s-button>
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
    async onInstallPlugin() {
        console.log('onInstallPlugin');
    //     await this.$apollo.mutate({
    //         mutation: DEPENDENCY_INSTALL,
    //         variables: {
    //             id: this.data.get('data').name,
    //             type: 'dependencies'
    //         }
    }
}
