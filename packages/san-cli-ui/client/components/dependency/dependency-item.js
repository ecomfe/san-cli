/**
 * @file 已安装依赖列表
 * @author sunxiaoyu333
 */

import Component from '@lib/san-component';
import {Notification, Modal} from 'santd';
import avatars from '@lib/utils/avatars';
import DEPENDENCY_UNINSTALL from '@/graphql/dependency/dependency-uninstall.gql';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependency-install.gql';
import './dependency-item.less';

export default class DependenceItem extends Component {
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
                            {{$t('dependency.version')}}{{item.detail.current || ' ...'}}
                        </span>
                        <span class="pkg-version">
                            {{$t('dependency.lowVersion')}}{{item.detail.wanted || ' ...'}}
                        </span>
                        <span class="pkg-version">
                            {{$t('dependency.currentVersion')}}{{item.detail.latest || ' ...'}}
                        </span>
                        <s-icon class="pkg-check-ico" type="check-circle" />
                        <span class="pkg-version">{{$t('dependency.installed')}}</span>
                        <s-tooltip
                            title="{{$t('dependency.tooltip.update')}}"
                            s-if="item.detail.current !== item.detail.latest">
                            <s-icon
                                type="arrow-up" 
                                class="update-icon highlight"
                                on-click="onPkgUpdate"
                            />
                        </s-tooltip>
                    </div>
                </div>
                <s-tooltip title="{{$t('dependency.tooltip.del')}}">
                    <s-icon type="delete" class="highlight" on-click="showDeleteConfirm"/>
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
        let {id, type} = this.data.get('item');
        this.data.set('loadingTip', this.$t('dependency.uninstall'));
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
            message: this.$t('dependency.deleteDependency'),
            description: this.$t('dependency.deleteSuccess')
        });
    }

    // 更新npm包
    async onPkgUpdate() {
        let {id, type} = this.data.get('item');
        this.data.set('loadingTip', this.$t('dependency.update'));
        this.data.set('spinning', true);
        await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                id,
                type
            }
        });
        this.fire('updatePkgList');
        this.data.set('spinning', false);
        Notification.open({
            message: this.$t('dependency.updateDependency'),
            description: this.$t('dependency.updateSuccess')
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
