/**
 * @file 安装依赖入口
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import DependencyHead from './dependence-head';
import DependencyItem from './dependency-item';
import DependencyPackageSearch from './dependency-package-search';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';
import './index.less';

export default class ProjectDependency extends Component {

    static template = /* html */`
        <div class="dependency">
            <s-dependence-head on-modeShow="onModeShow"/>
            <div class="dependency-body" s-if="listData.length">
                <span>{{$t('dependency.title')}}</span>
                <s-dependency-item s-for="item in listData" item="{{item}}"/>
            </div>
            <s-dependency-packgae-search s-if="npmPackageSearchShow" on-modeClose="onModeClose"/>
                
        </div>
    `;
    static components = {
        's-dependence-head': DependencyHead,
        's-dependency-item': DependencyItem,
        's-dependency-packgae-search': DependencyPackageSearch
    }
    initData() {
        return {
            npmPackageSearchShow: false,
            onModeClose: []
        };
    }
    async attached() {
        let listData = await this.$apollo.query({query: DEPENDENCIES});
        if (listData.data && listData.data.dependencies) {
            this.data.set('listData', listData.data.dependencies);
        }
    }
    onModeClose() {
        this.data.set('npmPackageSearchShow', false);
    }
    onModeShow() {
        this.data.set('npmPackageSearchShow', true);
    }
}
