/**
 * @file 搜索依赖模态框
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon, Radio, Pagination} from 'santd';
import axios from 'axios';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import 'santd/es/radio/style';
import 'santd/es/pagination/style';
import DependencySearchItem from './dependency-search-item';
import {searchParam} from '@lib/utils/searchParam';
import {SEARCHURL} from '@lib/const';
import './dependency-search.less';

export default class DependencePackageSearch extends Component {
    static template = /* html */`
        <div class="dependency-search">
            <div class="pkg-background"></div>
            <div class="pkg-modal">
                <div class="pkg-title">{{$t('dependency.newDependency')}}</div>
                <s-icon type="close" class="pkg-modal-close" on-click="onModalClose"/>
                <div class="pkg-input-warp">
                    <s-input-search class="pkg-search-input"/>
                    <s-group name="radiogroup" value="{{radioValue}}" on-change="onRadioChange">
                        <s-radio value="dependencies">{{$t('dependency.dependencies')}}</s-radio>
                        <s-radio value="devDependencies">{{$t('dependency.devDependencies')}}</s-radio>
                    </s-group>
                </div>
                <div class="pkg-search-item" s-if="searchData.length">
                    <c-dependency-search-item s-for="data, index in searchData"
                        data="{{data}}" installType="{{radioValue}}"/>
                    <s-pagination class="pkg-pagination" total="{{500}}" on-change="onPagination"></s-pagination>
                </div>
            </div>
        </div>
    `;
    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon,
        'c-dependency-search-item': DependencySearchItem,
        's-radio': Radio,
        's-group': Radio.Group,
        's-pagination': Pagination
    }
    initData() {
        return {
            searchData: [],
            // 运行依赖
            radioValue: 'dependencies',
            currentPage: 1
        };
    }
    inited() {
        this.search();
    }

    async search(name = '') {
        let param = searchParam({
            query: encodeURIComponent(name),
            maxValuesPerFacet: 20,
            page: 0,
            facets: ['name'],
            tagFilters: ''
        });
        let data = await axios({
            url: SEARCHURL,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                requests: [{
                    indexName: 'npm-search',
                    params: param
                }]
            }
        });
        let results = data && data.data && data.data.results;
        if (results && results.length) {
            this.data.set('searchData', results[0].hits);
        }
    }
    onModalClose() {
        this.fire('modalClose');
    }
    onRadioChange(event) {
        this.data.set('radioChange', event.target.value);
    }
    onPagination(event) {
        this.data.set('currentPage', event.page);

    }
}
