/**
 * @file 依赖管理
 */
import {Component} from 'san';
import Layout from '@components/layout';
import DependencyHead from '@components/dependency/dependency-head';
import DependencyItem from '@components/dependency/dependency-item';
import DependencyPackageSearch from '@components/dependency/dependency-package-search';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';
import './dependency.less';

export default class Dependency extends Component {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['dependency']}}" title="{{$t('dependency.title')}}">
            <div slot="content" class="dependency">
                <c-dependence-head on-modalShow="onModalShow"
                    on-radioChange="onRadioChange" radioValue="{{radioValue}}"/>
                <div class="pkg-body" s-if="listData.length">
                    <span>{{$t('dependency.title')}}</span>
                    <template s-for="item in listData">
                        <c-dependency-item s-if="item.type === radioValue" item="{{item}}"/>
                    </template>
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
            packageModalShow: false,
            radioValue: 'dependencies'
        };
    }
    attached() {
        this.initList();
        // this.watch('packageModalShow', packageModalShow => {
        //     if (!packageModalShow) {
        //         this.initList();
        //     }
        // });
    }
    // 初始化获取数据列表
    async initList() {
        let listData = await this.$apollo.query({query: DEPENDENCIES});
        if (listData.data && listData.data.dependencies) {
            this.data.set('listData', listData.data.dependencies);
        }
    }
    // 搜索模态框展示
    onModalClose() {
        this.data.set('packageModalShow', false);
    }
    // 搜索模态框取消
    onModalShow() {
        this.data.set('packageModalShow', true);
    }
    // 单选按钮点击
    onRadioChange(event) {
        let radioValue = event.target.value;
        this.data.set('radioValue', radioValue);
    }
}