/**
 * @file 依赖管理
 */
import {Component} from 'san';
import {createApolloComponent} from '@lib/san-apollo';
import Layout from '@components/layout';
import DependencyHead from '@components/dependency/dependency-head';
import DependencyItem from '@components/dependency/dependency-item';
import DependencyPackageSearch from '@components/dependency/dependency-package-search';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';
import './dependency.less';

export default class Dependency extends createApolloComponent(Component) {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['dependency']}}">
            <div slot="content" class="dependency">
                <c-dependence-head on-modalShow="onModalShow"/>
                <div class="pkg-body" s-if="listData.length">
                    <span>{{$t('dependency.title')}}</span>
                    <c-dependency-item s-for="item in listData" item="{{item}}"/>
                </div>
                <c-dependency-packgae-search s-if="packageModalShow" on-modalClose="onModalClose"/>
            </div>
        </c-layout>
    `;
    static components = {
        'c-layout': Layout,
        'c-dependence-head': DependencyHead,
        'c-dependency-item': DependencyItem,
        'c-dependency-packgae-search': DependencyPackageSearch
    };
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