/**
 * @file 搜索依赖模态框
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon, Radio, Pagination, Spin} from 'santd';
import axios from 'axios';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import 'santd/es/radio/style';
import 'santd/es/pagination/style';
import 'santd/es/spin/style';
import DependencySearchItem from './dependency-search-item';
import DependencyFilter from './dependency-filter';
import {searchParam} from '@lib/utils/searchParam';
import {SEARCH_URL, SEARCH_DEBOUNCE_DELAY, MAX_SEARCH_RESULT_TOTAL} from '@lib/const';
import './dependency-search.less';

// 和视图无关的数据
let searchTimeoutID;
let searchKeyword = '';

export default class DependencePackageSearch extends Component {
    static template = /* html */`
        <s-spin spinning="{{loading}}" class="dependency-search-wrap">
            <div class="dependency-search" slot="content">
                <c-dependence-filter on-keywordChange="keywordChange"/>
                <s-group name="radiogroup" value="{{radioValue}}" on-change="onRadioChange" class="pkg-radio">
                    <s-radio value="dependencies">{{$t('dependency.dependencies')}}</s-radio>
                    <s-radio value="devDependencies">{{$t('dependency.devDependencies')}}</s-radio>
                </s-group>
                <div class="pkg-search-item" s-if="searchData.length">
                    <c-dependency-search-item
                        s-for="data, index in searchData"
                        data="{{data}}"
                        installType="{{radioValue}}">
                    </c-dependency-search-item>
                    <s-pagination
                        class="pkg-pagination"
                        total="{{searchResultTotal}}"
                        on-change="onPagination"
                        pageSize="20">
                    </s-pagination>
                </div>
            </div>
        </s-spin>
    `;
    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon,
        's-radio': Radio,
        's-group': Radio.Group,
        's-pagination': Pagination,
        'c-dependency-search-item': DependencySearchItem,
        'c-dependence-filter': DependencyFilter,
        's-spin': Spin
    }
    initData() {
        return {
            searchData: [],
            // 运行依赖
            radioValue: 'dependencies',
            searchResultTotal: MAX_SEARCH_RESULT_TOTAL,
            loading: false
        };
    }
    inited() {
        this.search();
    }

    async search(name = '', page = 0) {
        let param = searchParam({
            query: encodeURIComponent(name),
            maxValuesPerFacet: 20,
            page,
            facets: ['name'],
            tagFilters: ''
        });
        let data = await axios({
            url: SEARCH_URL,
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
            const {hits, nbHits} = results[0];
            this.data.set('searchData', hits);
            this.data.set('searchResultTotal', nbHits > MAX_SEARCH_RESULT_TOTAL ? MAX_SEARCH_RESULT_TOTAL : nbHits);
            // 回到搜索结果列表的顶部
            this.nextTick(() => {
                document.querySelector('.pkg-search-item').scrollTop = 0;
            });

            this.data.set('loading', false);
        }
    }

    onRadioChange(event) {
        this.data.set('radioChange', event.target.value);
    }
    onPagination(event) {
        this.data.set('loading', true);
        this.search(searchKeyword, event.page - 1);
    }
    keywordChange(keyword) {
        keyword = keyword.trim();
        searchTimeoutID && clearTimeout(searchTimeoutID);
        searchTimeoutID = setTimeout(() => {
            searchKeyword = keyword;
            this.search(searchKeyword);
        }, SEARCH_DEBOUNCE_DELAY);
    }
}
