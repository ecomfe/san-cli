/**
 * @file 搜索依赖模态框
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon} from 'santd';
import DependencySearchItem from './dependency-search-item';
import './index.less';
import axios from 'axios';
import {searchParam} from '@lib/utils/searchParam';
import {SEARCHURL} from '@lib/const';

export default class DependencePackageSearch extends Component {
    static template = /* html */`
        <div class="dependency-package-search">
            <div class="backdrop"></div>
            <div class="wrap">
                <div class="title">{{$t('dependency.newDependency')}}</div>
                <s-icon type="close" class="close" on-click="modeClose"/>
                <div class="container">
                    <s-input-search class="head-input"/>
                </div>
                <div class="search-item">
                    <s-dependency-search-item s-for="data, index in searchData"
                        data="{{data}}" installType="{{installType}}"/>
                </div>
            </div>
        </div>
    `;
    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon,
        's-dependency-search-item': DependencySearchItem
    }
    initData() {
        return {
            searchData: {},
            // 运行依赖
            installType: 'dependencies'
        };
    }
    inited() {
        this.search();
    }
    modeClose() {
        this.fire('modeClose');
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
}
