/**
 * @file pkg搜索结果
 * @author sunxiaoyu333, Lohoyo，zttonly
 */

import Component from '@lib/san-component';
import axios from 'axios';
import DependencySearchItem from './dependency-search-item';
import {
    SEARCH_URL,
    SEARCH_MAX_RESULT_TOTAL,
    SEARCH_PAGE_SIZE,
    SEARCH_DEFAULT_QUERY,
    RANKING_MODE_MAP,
    RANKING_MODES
} from '@lib/const';
import './pkg-search-item.less';

export default class PackageSearchItem extends Component {
    static template = /* html */`
        <div class="pkg-search-item">
            <fragment s-if="searchData.length">
                <c-dependency-search-item
                    s-for="data in searchData"
                    data="{{data}}"
                    load-meta="{{loadMeta}}"
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
        const data = await axios({
            url: SEARCH_URL + RANKING_MODE_MAP[currentRankingMode],
            params: {
                // full-text search to apply
                text: encodeURIComponent(keyword),
                // how many results should be returned (default 20, max 250)
                size: SEARCH_PAGE_SIZE,
                // offset to return results from
                from: (page - 1) * SEARCH_PAGE_SIZE
            }
        });
        const results = data && data.data;
        if (results) {
            const {objects, total} = results;

            // 标记搜索结果中那些已安装的包
            const hash = this.data.get('installedPackages').reduce((accumulator, currentItem) => {
                accumulator[currentItem.id] = true;
                return accumulator;
            }, {});
            objects.forEach(item => {
                if (hash[item.package.name]) {
                    item.isInstalled = true;
                }
            });

            this.data.set('searchData', objects);
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
