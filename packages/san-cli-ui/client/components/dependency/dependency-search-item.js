/**
 * @file 搜索依赖模态框的item
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon, Spin, Notification} from 'santd';
import './dependency-search-item.less';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependency-install.gql';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import 'santd/es/spin/style';
import 'santd/es/notification/style';

export default class DependenceSearchItem extends Component {
    static template = /* html */`
        <s-spin size="large" spinning="{{spinning}}" tip="{{loadingTip}}">
            <div class="dependency-search-item" slot="content">
                <a href="{{data.repository.url}}" target="_blank" class="pkg-check">
                    <div class="pkg-icon" style="background-image: url({{data.owner.avatar}})"></div>
                </a>
                <div class="pkg-name-wrap">
                    <a href="{{data.repository.url}}" target="_blank" class="pkg-check">{{data.objectID}}</a>
                    <span class="pkg-version">{{data.version}}</span>
                    <s-icon type="download"/><span>{{downloadAmount}}</span>
                    <div class="pkg-description">{{data.description}}</div>
                </div>
                <s-button class="pkg-btn-operate" on-click="onInstallPlugin">{{$t('dependency.install')}}</s-button>
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

    // 点击安装
    async onInstallPlugin(e) {
        this.data.set('spinning', true);
        let data =  await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                id: this.data.get('data').objectID,
                type: this.data.get('installType')
            }
        });
        // 暂停加载状态
        this.data.set('spinning', false);
        Notification.open({
            message: this.$t('dependency.installDependency'),
            description: this.$t('dependency.installSuccess')
        });
    }
}
