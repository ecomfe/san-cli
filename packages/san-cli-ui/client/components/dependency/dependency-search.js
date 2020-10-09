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
    SEARCH_DEFAULT_QUERY,
    RANKING_MODES,
    RANKING_MODE_MAP
} from '@lib/const';
import './dependency-search.less';

export default class DependencyPackageSearch extends Component {
    static template = /* html */`
        <s-spin spinning="{{loading}}" class="dependency-search-wrap">
            <div class="dependency-search" slot="content">
                <s-dropdown trigger="click" class="ranking-mode">
                    <s-menu
                        slot="overlay"
                        on-click="changeRankingMode"
                        defaultSelectedKeys="{{[rankingModes[0]]}}"
                        style="box-shadow: 0 2px 20px rgba(0, 0, 0 , .1); border-radius: 5px; width: 160px;">
                        <s-menu-item s-for="rankingMode in rankingModes" key="{{rankingMode}}">
                            {{$t('dependency.' + rankingMode)}}
                        </s-menu-item>
                    </s-menu>
                    <s-button class="ranking-mode-btn">
                        {{$t('dependency.' + currentRankingMode)}} <s-icon type="down" />
                    </s-button>
                </s-dropdown>
                <c-dependency-filter class="dependency-search-dependency-filter" on-keywordChange="keywordChange"/>
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
                        pageSize="{{searchPageSize}}"
                        current="{{currentPage}}">
                    </s-pagination>
                </div>
            </div>
        </s-spin>
    `;
    static components = {
        'c-dependency-search-item': DependencySearchItem,
        'c-dependency-filter': DependencyFilter,
    }
    initData() {
        return {
            searchData: [],
            // 运行依赖
            radioValue: 'dependencies',
            searchResultTotal: SEARCH_MAX_RESULT_TOTAL,
            searchPageSize: SEARCH_PAGE_SIZE,
            loading: true,
            rankingModes: RANKING_MODES,
            currentRankingMode: RANKING_MODES[0],
            currentPage: 1
        };
    }
    inited() {
        this.search();
    }

    async search(keyword, page = 1) {
        keyword = keyword || this.keyword || SEARCH_DEFAULT_QUERY;
        let data = await axios({
            url: SEARCH_URL + RANKING_MODE_MAP[this.data.get('currentRankingMode')],
            params: {
                // full-text search to apply
                text: encodeURIComponent(keyword),
                // how many results should be returned (default 20, max 250)
                size: SEARCH_PAGE_SIZE,
                // offset to return results from
                from: (page - 1) * SEARCH_PAGE_SIZE
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
            this.data.set('currentPage', page);

            this.data.set('loading', false);
        }
    }

    onRadioChange(event) {
        this.data.set('radioChange', event.target.value);
    }
    onPagination(event) {
        this.data.set('loading', true);
        this.search(this.keyword, event.page);
    }
    keywordChange(keyword) {
        this.keyword = keyword.trim();
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }
        this.searchTimer = setTimeout(() => {
            this.search();
        }, SEARCH_DEBOUNCE_DELAY);
    }
    changeRankingMode({key}) {
        this.data.set('currentRankingMode', key);
        this.search();
    }
}
