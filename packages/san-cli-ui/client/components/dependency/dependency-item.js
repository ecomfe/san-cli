/**
 * @file 已安装依赖列表
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Button, Icon, Spin, Notification, Popconfirm} from 'santd';
import avatars from '@lib/utils/avatars';
import DEPENDENCY_UNINSTALL from '@/graphql/dependency/dependency-uninstall.gql';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependency-install.gql';
import './dependency-item.less';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import 'santd/es/spin/style';
import 'santd/es/notification/style';
import 'santd/es/popover/style';

export default class DependenceItem extends Component {
    static template = /* html */`
        <s-spin class="loading" size="large" spinning="{{spinning}}" tip="{{loadingTip}}">
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
                        <s-icon type="download" class="pkg-download" on-click="onPkgUpdate"/>
                    </div>
                </div>
            
                 <s-popconfirm
                    title="{{$t('dependency.confirmUninstall') + item.id + '?'}}"
                    okText="{{$t('confirmText')}}"
                    cancelText="{{$t('cancelText')}}"
                    on-confirm="onPkgDelete">
                        <s-icon type="delete" class="highlight" />
                 </s-popconfirm>
            </div>
        </s-spin>
    `;

    static components = {
        's-button': Button,
        's-icon': Icon,
        's-spin': Spin,
        's-popconfirm': Popconfirm
    }

    initData() {
        return {
            loadingTip: this.$t('dependency.uninstall'),
            spinning: false
        };
    }

    async onPkgDelete() {
        // 卸载npm包
        let {id, type} = this.data.get('item');
        this.data.set('spinning', true);
        await this.$apollo.mutate({
            mutation: DEPENDENCY_UNINSTALL,
            variables: {
                id,
                type
            }
        });
        this.fire('pkgDelete');
        this.data.set('spinning', false);
        Notification.open({
            message: this.$t('dependency.deleteDependency'),
            description: this.$t('dependency.deleteSuccess')
        });
    }

    // 更新npm包
    async onPkgUpdate() {
        let {id, type} = this.data.get('item');
        await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                id,
                type
            }
        });
    }

    avatars(packageName) {
        return avatars(packageName);
    }
}