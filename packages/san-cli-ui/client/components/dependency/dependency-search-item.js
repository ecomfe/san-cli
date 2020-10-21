/**
 * @file 搜索依赖模态框的item
 * @author sunxiaoyu333, Lohoyo, zttonly
 */

import Component from '@lib/san-component';
import axios from 'axios';
import {Notification} from 'santd';
import './dependency-search-item.less';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependencyInstall.gql';

/**
 * 组件props
 *
 * @param {Object} data 依赖的信息
 * @param {String} installType 运行依赖还是开发依赖
 * @param {String} type 依赖类型还是插件类型
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
                    <s-tooltip s-if="hasGenerator"
                        title="{{$t('plugins.generator')}}">
                        <s-icon type="file-add" style="font-size: 16px"/>
                    </s-tooltip>
                    <s-tooltip s-if="hasUiIntegration"
                        title="{{$t('plugins.ui-integration')}}">
                        <s-icon type="bg-colors" style="font-size: 16px"/>
                    </s-tooltip>
                    <div class="pkg-description">{{data.package.description}}</div>
                </div>
                <s-button
                    class="pkg-btn-operate"
                    on-click="installDependency"
                    type="primary"
                    disabled="{{data.isInstalled}}">
                    {{data.isInstalled ? $t('dependency.installed') : $t('dependency.install')}}
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
            spinning: false,
            hasGenerator: false,
            hasUiIntegration: false
        };
    }

    // 设置加载显示的提示条
    async inited() {
        this.data.set('loadingTip', this.$t('dependency.installing'));
        this.watch('data', () => {
            if (this.data.get('spinning')) {
                this.data.set('spinning', false);
            }
            this.updateMetadata();
        });
        this.updateMetadata();
    }
    // 安装依赖
    async installDependency() {
        this.data.set('spinning', true);
        const {name, version} = this.data.get('data.package');
        await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                input: {
                    id: name,
                    type: this.data.get('installType'),
                    range: version
                }
            }
        });
        this.data.set('spinning', false);
        Notification.open({
            message: this.$t('dependency.installDependency') + ' ' + name,
            description: this.$t('dependency.installSuccess')
        });
        this.$emit('refreshPackages');
        this.data.set('data.isInstalled', true);
    }

    updateMetadata() {
        const name = this.data.get('data.package.name');
        this.data.set('hasUiIntegration', false);
        this.data.set('hasGenerator', false);

        if (this.data.get('type') === 'plugin') {
            axios.get(`https://unpkg.com/${name}/ui`).then(response => {
                if (name !== this.data.get('data.package.name')) {
                    return;
                }
                this.data.set('hasUiIntegration', response.status === 200);
            }).catch(err => {
                // console.log(err);
            });

            axios.get(`https://unpkg.com/${name}/generator`).then(response => {
                if (name !== this.data.get('data.package.name')) {
                    return;
                }
                this.data.set('hasGenerator', response.status === 200);
            }).catch(err => {
                // console.log(err);
            });
        }
    }
}
