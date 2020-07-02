/**
 * @file NpmPackageSearch组件
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon} from 'santd';
import PackageSearchItem from './PackageSearchItem';
import './index.less';
import axios from 'axios';
import {searchParam} from '@lib/utils/searchParam';
import {SEARCHURL} from '@lib/const';

export default class NpmPackageSearch extends Component {
    static template = /* html */`
        <div class="npm">
            <div class="backdrop"></div>
            <div class="wrap">
                <div class="title">安装新的依赖</div>
                <s-icon type="close" class="close" on-click="modeClose"/>
                <div class="container">
                    <s-input-search class="head-input"/>
                </div>
                <div class="search-item">
                    <s-package-search-item s-for="data, index in searchData" data="{{data}}"/>
                </div>
            </div>
        </div>
    `;
    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon,
        's-package-search-item': PackageSearchItem
    }
    initData() {
        return {
            searchData: {}
        };
    }
    inited() {
        this.search();
    }
    modeClose() {
        this.fire('modeClose');
    }
    search(name = '') {
        let param = searchParam({
            query: encodeURIComponent(name),
            maxValuesPerFacet: 20,
            page: 0,
            facets: ['name'],
            tagFilters: ''
        });
        axios({
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
        }).then(data => {
            let results = data && data.data && data.data.results;
            if (results && results.length) {
                this.data.set('searchData', results[0].hits);
            }
        });
    }
}
