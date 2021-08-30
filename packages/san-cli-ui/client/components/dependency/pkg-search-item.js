/**
 * @file pkg搜索结果
 * @author sunxiaoyu333, Lohoyo，zttonly
 */

import Component from '@lib/san-component';
import DependencySearchItem from './dependency-search-item';
import {
    SEARCH_MAX_RESULT_TOTAL,
    SEARCH_PAGE_SIZE,
    SEARCH_DEFAULT_QUERY,
    RANKING_MODES
} from '@lib/const';
import DEPENDENCIES_SEARCH from '@/graphql/dependency/dependenciesSearch.gql';
import './pkg-search-item.less';

/**
 * 组件props
 *
 * @param {Array} installedPackages 已安装的包
 * @param {Boolean} loading 是否展示loading态
 * @param {String} currentRankingMode 搜索结果的排序模式
 * @param {String} installType 安装类型
 * @param {String} keyword 搜索关键字
 * @param {String} type 依赖类型还是插件类型
 */
export default class PackageSearchItem extends Component {
    static template = /* html */`
        <div class="pkg-search-item">
            <fragment s-if="searchData.length">
                <c-dependency-search-item
                    s-for="data in searchData"
                    data="{{data}}"
                    type="{{type}}"
                    install-type="{{installType}}">
                </c-dependency-search-item>
                <s-pagination
                    class="pkg-pagination"
                    total="{{searchResultTotal}}"
                    on-change="onPagination"
                    pageSize="{{searchPageSize}}"
                    current="{{currentPage}}">
                </s-pagination>
            </fragment>
            <div s-elif="!loading" class="empty-tip">{{$t('dependency.emptyTip')}}</div>
        </div>
    `;

    static components = {
        'c-dependency-search-item': DependencySearchItem
    };

    initData() {
        return {
            searchData: [],
            // 运行依赖
            searchResultTotal: SEARCH_MAX_RESULT_TOTAL,
            searchPageSize: SEARCH_PAGE_SIZE,
            currentPage: 1,
            currentRankingMode: RANKING_MODES[0],
            installType: 'devDependencies'
        };
    }

    inited() {
        this.search();
    }

    attached() {
        this.watch('currentRankingMode', value => {
            this.search();
        });
        this.watch('keyword', value => {
            this.search();
        });
    }

    async search(page = 1) {
        this.fire('loading', true);
        let {keyword, currentRankingMode} = this.data.get();
        keyword = keyword || SEARCH_DEFAULT_QUERY;
        const input = {
            text: keyword,
            // how many results should be returned (default 20, max 250)
            size: SEARCH_PAGE_SIZE,
            // offset to return results from
            from: (page - 1) * SEARCH_PAGE_SIZE
        };
        // quality / maintenance / popularity
        if (currentRankingMode) {
            input[currentRankingMode] = '1.0';
        }
        const data = await this.$apollo.query({
            query: DEPENDENCIES_SEARCH,
            variables: {input},
            fetchPolicy: 'cache-first'
        });

        const {dependenciesSearch} = data ? data.data : {};
        if (dependenciesSearch) {
            let {list, total} = dependenciesSearch;

            if (this.data.get('type') === 'plugins') {
                list = list.filter(item => item.name.indexOf(keyword) === 0);
            }

            // 标记搜索结果中那些已安装的包
            const hash = this.data.get('installedPackages').reduce((accumulator, currentItem) => {
                accumulator[currentItem.id] = true;
                return accumulator;
            }, {});

            list.forEach(item => {
                if (hash[item.name]) {
                    item.isInstalled = true;
                }
            });

            this.data.set('searchData', list);
            this.data.set('searchResultTotal', total > SEARCH_MAX_RESULT_TOTAL ? SEARCH_MAX_RESULT_TOTAL : total);

            // 回到搜索结果列表的顶部
            this.nextTick(() => {
                const element = document.querySelector('.pkg-search-item');
                if (element) {
                    element.scrollTop = 0;
                }
            });
            this.data.set('currentPage', page);

            this.fire('loading', false);
        }
    }

    onPagination(event) {
        this.search(event.page);
    }
}
