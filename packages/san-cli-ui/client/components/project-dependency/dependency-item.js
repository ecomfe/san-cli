/**
 * @file 已安装依赖列表
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Button, Icon} from 'santd';
import DEPENDENCYITEM from '@graphql/dependency/dependencyItem.gql';
import DEPENDENCY_UNINSTALL from '@/graphql/dependency/dependency-uninstall.gql';
import avatars from '@lib/utils/avatars';
import './index.less';

export default class DependenceItem extends Component {
    static template = /* html */`
        <div class="dependency-item">
            <div class="item">
                <div class="image-wrap"><img class="image" src="{{avatars(item.id)}}"/></div>
                <div class="name-wrap">
                    <div class="name">{{item.id}}</div>
                    <div class="version">{{$t('dependency.version')}}{{dependencyItem.current}}</div>
                </div>
                <div class="version name-wrap">{{$t('dependency.lowVersion')}}{{dependencyItem.wanted}}</div>
                <div class="version name-wrap">{{$t('dependency.currentVersion')}}{{dependencyItem.latest}}</div>
                <s-icon type="check-circle" class="name-wrap"/>
                <div class="status">{{$t('dependency.installed')}}</div>
                <div class="check" on-click="onCheck">{{$t('dependency.checkDetail')}}</div>
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

    async onDelete() {
        // 卸载npm包
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
