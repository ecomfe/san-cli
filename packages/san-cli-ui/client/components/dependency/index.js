/**
 * @file 安装依赖入口
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import DependencyHead from './dependency-head';
import DependencyItem from './dependency-item';
import DependencyPackageSearch from './dependency-package-search';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';
import './index.less';

export default class ProjectDependency extends Component {

    static template = /* html */`
        <div class="dependency">
            <c-dependence-head on-modalShow="onModalShow"/>
            <div class="pkg-body" s-if="listData.length">
                <span>{{$t('dependency.title')}}</span>
                <c-dependency-item s-for="item in listData" item="{{item}}"/>
            </div>
            <c-dependency-packgae-search s-if="packageModalShow" on-modalClose="onModalClose"/>
        </div>
    `;
    static components = {
        'c-dependence-head': DependencyHead,
        'c-dependency-item': DependencyItem,
        'c-dependency-packgae-search': DependencyPackageSearch
    }
    initData() {
        return {
            packageModalShow: false
        };
    }
    async attached() {
        let listData = await this.$apollo.query({query: DEPENDENCIES});
        if (listData.data && listData.data.dependencies) {
            this.data.set('listData', listData.data.dependencies);
        }
    }
    onModalClose() {
        this.data.set('packageModalShow', false);
    }
    onModalShow() {
        this.data.set('packageModalShow', true);
    }
}
