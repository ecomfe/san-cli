/**
 * @file 搜索依赖模态框的item
 * @author sunxiaoyu333, Lohoyo
 */

import Component from '@lib/san-component';
import {Notification} from 'santd';
import './dependency-search-item.less';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependencyInstall.gql';

/**
 * 组件props
 *
 * @param {Object} data 依赖的信息
 * @param {String} installType 运行依赖还是开发依赖
 */
export default class DependencySearchItem extends Component {
    static template = /* html */`
        <s-spin size="large" spinning="{{spinning}}" tip="{{loadingTip}}">
            <div class="dependency-search-item" slot="content">
                <a href="{{data.package.links.npm}}" target="_blank" class="pkg-check">
                    <div class="pkg-icon" style="background-image: url({{authorAvatar}})"></div>
                </a>
                <div class="pkg-name-wrap">
                    <a href="{{data.package.links.npm}}" target="_blank" class="pkg-name">{{data.package.name}}</a>
                    <span class="pkg-version">{{data.package.version}}</span>
                    <div class="pkg-description">{{data.package.description}}</div>
                </div>
                <s-button class="pkg-btn-operate" on-click="onInstallPlugin" type="primary">
                    {{$t('dependency.install')}}
                </s-button>
            </div>
        </s-spin>
    `;

    static computed = {
        authorAvatar() {
            return `https://s.gravatar.com/avatar/${
                require('md5')(this.data.get('data.package.publisher.email'))
            }?default=retro`;
        }
    }

    initData() {
        return {
            loadingTip: '',
            spinning: false
        };
    }

    // 设置加载显示的提示条
    async inited() {
        this.data.set('loadingTip', this.$t('dependency.installing'));
        this.watch('data', () => {
            if (this.data.get('spinning')) {
                this.data.set('spinning', false);
            }
        });
    }

    // 点击安装
    async onInstallPlugin(e) {
        this.data.set('spinning', true);
        const packageName = this.data.get('data').package.name;
        await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                id: packageName,
                type: this.data.get('installType')
            }
        });
        // 暂停加载状态
        this.data.set('spinning', false);
        Notification.open({
            message: this.$t('dependency.installDependency') + ' ' + packageName,
            description: this.$t('dependency.installSuccess')
        });
    }
}
