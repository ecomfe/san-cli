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
import DependencyFilter from './dependency-filter';
import {searchParam} from '@lib/utils/searchParam';
import {SEARCHURL} from '@lib/const';
import './dependency-search.less';

export default class DependencePackageSearch extends Component {
    static template = /* html */`
        <div  class="dependency-search">
            <c-dependence-filter on-keywordChange="keywordChange"/>
            <s-group name="radiogroup" value="{{radioValue}}" on-change="onRadioChange" class="pkg-radio">
                <s-radio value="dependencies">{{$t('dependency.dependencies')}}</s-radio>
                <s-radio value="devDependencies">{{$t('dependency.devDependencies')}}</s-radio>
            </s-group>
            <div class="pkg-search-item" s-if="searchData.length">
                <c-dependency-search-item s-for="data, index in searchData"
                    data="{{data}}" installType="{{radioValue}}"/>
                <s-pagination class="pkg-pagination" total="{{500}}" on-change="onPagination"></s-pagination>
            </div>
        </div>
    `;
    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon,
        's-radio': Radio,
        's-group': Radio.Group,
        's-pagination': Pagination,
        'c-dependency-search-item': DependencySearchItem,
        'c-dependence-filter': DependencyFilter
    }
    initData() {
        return {
            keyword: '',
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

    onRadioChange(event) {
        this.data.set('radioChange', event.target.value);
    }
    onPagination(event) {
        this.data.set('currentPage', event.page);
    }
    keywordChange(keyword) {
        keyword = keyword.trim();
        this.data.set('keyword', keyword);
    }
}
