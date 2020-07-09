/**
 * @file 已安装依赖列表
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Button, Icon, Spin} from 'santd';
import DEPENDENCYITEM from '@graphql/dependency/dependencyItem.gql';
import DEPENDENCY_UNINSTALL from '@/graphql/dependency/dependency-uninstall.gql';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependency-install.gql';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';
import avatars from '@lib/utils/avatars';
import './dependency-item.less';

export default class DependenceItem extends Component {
    static template = /* html */`
        <s-spin class="loading" size="large" spinning="{{spinning}}" tip="{{loadingTip}}">
            <div class="x-dependency-item" slot="content">
                <div class="pkg-icon" style="background-image: url({{avatars(item.id)}})"></div>
                <div class="pkg-info">
                    <div class="pkg-name">{{item.id}}</div>
                    <div class="pkg-detail" s-if="{{dependencyItem.current}}">
                        <span class="pkg-version">{{$t('dependency.version')}}{{dependencyItem.current}}</span>
                        <span class="pkg-version">{{$t('dependency.lowVersion')}}{{dependencyItem.wanted}}</span>
                        <span class="pkg-version">{{$t('dependency.currentVersion')}}{{dependencyItem.latest}}</span>
                        <s-icon class="pkg-check-ico" type="check-circle" />
                        <span class="pkg-version">{{$t('dependency.installed')}}</span>
                        <a s-if="{{item.website}}" href="{{item.website}}" 
                            target="_blank"
                            class="pkg-detail-link">
                            {{$t('dependency.checkDetail')}}
                        </a>
                    </div>
                </div>
                <s-icon type="delete" on-click="onDelete"/>
            </div>
        </s-spin>
    `;

    static components = {
        's-button': Button,
        's-icon': Icon,
        's-spin': Spin
    }

    initData() {
        return {
            dependencyItem: {},
            loadingTip: '',
            spinning: false
        };
    }

    async inited() {
        this.data.set('loadingTip', this.$t('dependency.uninstall'));
        let item = this.data.get('item');
        let mutation = await this.$apollo.mutate({
            mutation: DEPENDENCYITEM,
            variables: {
                id: item.id
            }
        });
        if (mutation.data && mutation.data.dependencyItem) {
            this.data.set('dependencyItem', mutation.data.dependencyItem);
        }
    }

    async onDelete() {
        // 卸载npm包
        let {id, type} = this.data.get('item');
        this.data.set('spinning', true);
        await this.$apollo.mutate({
            mutation: DEPENDENCY_UNINSTALL,
            variables: {
                id,
                type
            },
            update: async (cache, {data: {dependencyUninstall}}) => {
                // 暂停加载状态
                let cacheData = cache.readQuery({query: DEPENDENCIES});
                // TODO: 同步数据
            }
        });
        this.data.set('spinning', false);
    }
    async onUpdate() {
        // 更新npm包
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