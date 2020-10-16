/**
 * @file 已安装依赖列表
 * @author sunxiaoyu333, Lohoyo
 */

import Component from '@lib/san-component';
import {Notification, Modal} from 'santd';
import avatars from '@lib/utils/avatars';
import DEPENDENCY_UNINSTALL from '@/graphql/dependency/dependencyUninstall.gql';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependencyInstall.gql';
import './dependency-item.less';

/**
 * 组件props
 *
 * @param {Object} item 当前的依赖信息
 */
export default class DependencyItem extends Component {
    static template = /* html */`
        <s-spin size="large" spinning="{{spinning}}" tip="{{loadingTip}}">
            <div class="x-dependency-item" slot="content">
                <a href="{{item.website}}" target="_blank">
                    <div class="pkg-icon" style="background-image: url({{avatars(item.id)}})"></div>
                </a>
                <div class="pkg-info">
                    <a href="{{item.website}}" target="_blank">{{item.id}}</a>
                    <div class="pkg-detail">
                        <span class="pkg-version">
                            {{$t('dependency.version')}} {{item.detail.current || ' ...'}}
                        </span>
                        <span class="pkg-version">
                            {{$t('dependency.wanted')}} {{item.detail.wanted || ' ...'}}
                        </span>
                        <span class="pkg-version">
                            {{$t('dependency.latest')}} {{item.detail.latest || ' ...'}}
                        </span>
                    </div>
                </div>
                <fragment s-if="{{item.installed}}">
                    <s-tooltip
                        s-if="item.detail.current !== item.detail.wanted"
                        title="{{$t('dependency.tooltip.update')}}">
                        <div class="update-icon" on-click="onPkgDownload"></div>
                    </s-tooltip>
                </fragment>
                <fragment s-else>
                    <s-tooltip title="{{$t('dependency.tooltip.install')}}">
                        <s-icon type="download" class="download-icon" on-click="onPkgDownload" />
                    </s-tooltip>
                    <div class="uninstalled-label">
                        <div class="uninstalled-label-text">{{$t('dependency.uninstalled')}}</div>
                    </div>
                </fragment>
                <s-tooltip title="{{$t('dependency.tooltip.del')}}" class="delete-tooltip">
                    <div class="delete-icon" on-click="showDeleteConfirm"></div>
                </s-tooltip>
            </div>
        </s-spin>
    `;

    initData() {
        return {
            spinning: false
        };
    }

    // 卸载npm包
    async onPkgDelete() {
        let {id, type = 'devDependencies'} = this.data.get('item');
        this.data.set('loadingTip', this.$t('dependency.uninstalling'));
        this.data.set('spinning', true);
        await this.$apollo.mutate({
            mutation: DEPENDENCY_UNINSTALL,
            variables: {
                id,
                type
            }
        });
        this.fire('updatePkgList');
        this.data.set('spinning', false);
        Notification.open({
            message: this.$t('dependency.deleteDependency') + ' ' + id,
            description: this.$t('dependency.deleteSuccess')
        });
    }

    // 安装/更新npm包
    async onPkgDownload() {
        const {id, type = 'devDependencies', installed, detail} = this.data.get('item');
        this.data.set('loadingTip', this.$t('dependency.' + installed ? 'updating' : 'installing'));
        this.data.set('spinning', true);
        await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                input: {
                    id,
                    type,
                    range: detail.range
                }
            }
        });
        this.fire('updatePkgList');
        this.data.set('spinning', false);
        Notification.open({
            message: this.$t('dependency.' + (installed ? 'updateDependency' : 'installDependency')) + ' ' + id,
            description: this.$t('dependency.' + (installed ? 'updateSuccess' : 'installSuccess'))
        });
    }

    avatars(packageName) {
        return avatars(packageName);
    }

    showDeleteConfirm() {
        Modal.confirm({
            title: this.$t('dependency.confirmUninstall') + ' ' + this.data.get('item.id') + ' ？',
            okText: this.$t('confirmText'),
            okType: 'danger',
            cancelText: this.$t('cancelText'),
            onOk: () => this.onPkgDeleteWrap()
        });
    }

    // 不裹一层的话，用户点击确认后模态窗不会立刻消失，体验不好
    onPkgDeleteWrap() {
        this.onPkgDelete();
    }
}
