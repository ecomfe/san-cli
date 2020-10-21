/**
 * @file 搜索依赖模态框
 * @author sunxiaoyu333, Lohoyo, zttonly
 */

import Component from '@lib/san-component';
import DependencyFilter from './dependency-filter';
import PkgSearchItem from './pkg-search-item';
import {
    SEARCH_DEBOUNCE_DELAY,
    RANKING_MODES
} from '@lib/const';
import './dependency-search.less';

/**
 * 组件props
 *
 * @param {Array} dependencies 本地依赖列表
 */
export default class DependencyPackageSearch extends Component {
    static template = /* html */`
        <s-spin spinning="{{loading}}" class="dependency-search-wrap">
            <div class="dependency-search" slot="content">
                <s-dropdown trigger="click" class="ranking-mode" overlayClassName="dependency-search-dropdown">
                    <s-menu
                        slot="overlay"
                        on-click="changeRankingMode"
                        defaultSelectedKeys="{{[rankingModes[0]]}}">
                        <s-menu-item s-for="rankingMode in rankingModes" key="{{rankingMode}}">
                            {{$t('dependency.' + rankingMode)}}
                        </s-menu-item>
                    </s-menu>
                    <s-button class="ranking-mode-btn">
                        {{$t('dependency.' + currentRankingMode)}} <s-icon type="down" />
                    </s-button>
                </s-dropdown>
                <c-dependency-filter class="dependency-search-dependency-filter" on-keywordChange="keywordChange"/>
                <s-radio-group
                    name="radiogroup"
                    defaultValue="dependencies"
                    on-change="onRadioChange"
                    class="pkg-radio">
                    <s-radio-button value="dependencies">{{$t('dependency.dependencies')}}</s-radio-button>
                    <s-radio-button value="devDependencies">{{$t('dependency.devDependencies')}}</s-radio-button>
                </s-radio-group>
                <c-pkg-search-item
                    keyword="{{keyword}}"
                    install-type="{{radioValue}}"
                    current-ranking-mode="{{currentRankingMode}}"
                    on-loading="onLoadingChange"
                    loading="{{loading}}"
                    installedPackages="{{dependencies}}"
                    type="dependency">
                </c-pkg-search-item>
            </div>
        </s-spin>
    `;
    static components = {
        'c-dependency-filter': DependencyFilter,
        'c-pkg-search-item': PkgSearchItem
    };
    initData() {
        return {
            // 运行依赖
            radioValue: 'dependencies',
            loading: true,
            rankingModes: RANKING_MODES,
            currentRankingMode: RANKING_MODES[0],
            keyword: ''
        };
    }
    onLoadingChange(e) {
        this.data.set('loading', e);
    }
    onRadioChange(event) {
        this.data.set('radioValue', event.target.value);
    }

    keywordChange(keyword) {
        let kw = keyword.trim();
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }
        this.searchTimer = setTimeout(() => {
            this.data.set('keyword', kw);
        }, SEARCH_DEBOUNCE_DELAY);
    }
    changeRankingMode({key}) {
        this.data.set('currentRankingMode', key);
    }
}
