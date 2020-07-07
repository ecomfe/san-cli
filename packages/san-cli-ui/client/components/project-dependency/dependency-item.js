/**
 * @file 项目依赖列表
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Button, Icon} from 'santd';
import DEPENDENCYITEM from '@graphql/dependency/dependencyItem.gql';
import DEPENDENCY_UNINSTALL from '@/graphql/dependency/dependency-uninstall.gql';
import avatars from '@lib/utils/avatars';
import './dependency-item.less';

export default class DependenceItem extends Component {
    static template = /* html */`
        <div class="x-dependency-item">
            <div class="pkg-icon"><img src="{{avatars(item.id)}}"/></div>
            <div class="pkg-info">
                <div class="pkg-name">{{item.id}}</div>
                <div class="pkg-detail" s-if="{{dependencyItem.current}}">
                    <span class="pkg-version">{{$t('dependency.version')}}{{dependencyItem.current}}</span>
                    <span class="pkg-version">{{$t('dependency.lowVersion')}}{{dependencyItem.wanted}}</span>
                    <span class="pkg-version">{{$t('dependency.currentVersion')}}{{dependencyItem.latest}}</span>
                    <s-icon class="pkg-check-ico" type="check-circle" />
                    <span class="status">{{$t('dependency.installed')}}</span>
                    <span class="pkg-detail-item pkg-detail-link" on-click="onCheck">
                        {{$t('dependency.checkDetail')}}
                    </span>
                </div>
            </div>
            <s-icon type="delete" on-click="onDelete" class="delete"/>
        </div>
    `;

    static components = {
        's-button': Button,
        's-icon': Icon
    }

    initData() {
        return {
            dependencyItem: {}
        };
    }

    async inited() {
        const {id} = this.data.get('item');
        const mutation = await this.$apollo.mutate({
            mutation: DEPENDENCYITEM,
            variables: {
                id
            }
        });
        if (mutation.data && mutation.data.dependencyItem) {
            this.data.set('dependencyItem', mutation.data.dependencyItem);
        }
    }

    onCheck() {
        let website = this.data.get('item').website;
        window.open(website);
    }

    // 卸载npm包
    async onDelete() {
        let {id, type} = this.data.get('item');
        await this.$apollo.mutate({
            mutation: DEPENDENCY_UNINSTALL,
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
