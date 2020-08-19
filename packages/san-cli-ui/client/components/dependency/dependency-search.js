/**
 * @file 搜索依赖模态框
 * @author sunxiaoyu333
 */

import Component from '@lib/san-component';
import axios from 'axios';
import DependencySearchItem from './dependency-search-item';
import DependencyFilter from './dependency-filter';
import {
    SEARCH_URL,
    SEARCH_DEBOUNCE_DELAY,
    SEARCH_MAX_RESULT_TOTAL,
    SEARCH_PAGE_SIZE,
    SEARCH_DEFAULT_QUERY
} from '@lib/const';
import './dependency-search.less';

// 和视图不直接相关的数据
let searchTimeoutID;
let searchKeyword = '';

export default class DependencePackageSearch extends Component {
    static template = /* html */`
        <s-spin spinning="{{loading}}" class="dependency-search-wrap">
            <div class="dependency-search" slot="content">
                <c-dependence-filter on-keywordChange="keywordChange"/>
                <s-radio-group name="radiogroup" value="{{radioValue}}" on-change="onRadioChange" class="pkg-radio">
                    <s-radio-button value="dependencies">{{$t('dependency.dependencies')}}</s-radio-button>
                    <s-radio-button value="devDependencies">{{$t('dependency.devDependencies')}}</s-radio-button>
                </s-radio-group>
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
                        pageSize="{{searchPageSize}}">
                    </s-pagination>
                </div>
            </div>
        </s-spin>
    `;
    static components = {
        'c-dependency-search-item': DependencySearchItem,
        'c-dependence-filter': DependencyFilter,
    }
    initData() {
        return {
            searchData: [],
            // 运行依赖
            radioValue: 'dependencies',
            searchResultTotal: SEARCH_MAX_RESULT_TOTAL,
            searchPageSize: SEARCH_PAGE_SIZE,
            loading: false
        };
    }
    inited() {
        this.search();
    }

    async search(name, page = 0) {
        let data = await axios({
            url: SEARCH_URL,
            params: {
                // full-text search to apply
                text: encodeURIComponent(name || SEARCH_DEFAULT_QUERY),
                // how many results should be returned (default 20, max 250)
                size: SEARCH_PAGE_SIZE,
                // offset to return results from
                from: page * SEARCH_PAGE_SIZE
            }
        });
        let results = data && data.data;
        if (results) {
            const {objects, total} = results;
            this.data.set('searchData', objects);
            this.data.set('searchResultTotal', total > SEARCH_MAX_RESULT_TOTAL ? SEARCH_MAX_RESULT_TOTAL : total);
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
