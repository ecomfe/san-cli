/**
 * @file 安装依赖入口
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import Head from './head';
import Body from './body';
import NpmPackageSearch from './npmPackageSearch';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';
import DEPENDENCYITEM from '@graphql/dependency/dependencyItem.gql';
import './index.less';
// import PROJECT_NPM_PACKAGE from '@graphql/project/projectNpmPackage.gql';


export default class ProjectRely extends Component {

    static template = /* html */`
        <div class="rely">
            <s-head on-modeShow="onModeShow"/>
            <div class="rely-body"><s-body/></div>
            <s-npm-packgae-search s-if="npmPackageSearchShow" on-modeClose="onModeClose"/>
                
        </div>
    `;
    static components = {
        's-head': Head,
        's-body': Body,
        's-npm-packgae-search': NpmPackageSearch
    }
    static computed = {
    };
    initData() {
        return {
            npmPackageSearchShow: false
        };
    }
    async attached() {
        let cacheData = await this.$apollo.query({query: DEPENDENCIES});
        let result = await this.$apollo.mutate({
            mutation: DEPENDENCYITEM,
            variables: {
                id: 'lodash'
            }
        });
    }
    onModeClose() {
        this.data.set('npmPackageSearchShow', false);
    }
    onModeShow() {
        this.data.set('npmPackageSearchShow', true);
    }
}
