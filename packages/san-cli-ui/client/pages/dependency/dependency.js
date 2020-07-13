/**
 * @file 依赖管理
 */
import {Component} from 'san';
import fastq from 'fastq';
import Layout from '@components/layout';
import DependencyFilter from '@components/dependency/dependency-filter';
import DependencyItem from '@components/dependency/dependency-item';
import DependencySearch from '@components/dependency/dependency-search';
import Modal from '@components/modal/modal';
import DEPENDENCIES from '@graphql/dependency/dependencies.gql';
import DEPENDENCY_ITEM from '@graphql/dependency/dependencyItem.gql';
import {Button, Icon} from 'santd';
import './dependency.less';
import 'santd/es/button/style';


export default class Dependency extends Component {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['dependency']}}" title="{{title}}">
            <template slot="right" s-if="!modalVisible">
                <s-button type="primary" on-click="onModalShow">
                    <s-icon type="plus"/>{{$t('dependency.installDependency')}}
                </s-button>
            </template>
            <div slot="content" class="dependency">
                <c-dependence-filter on-keywordChange="keywordChange" />
                <div class="dependency-wrapper">
                    <div class="pkg-body" s-if="dependencies.length">
                        <h2>{{$t('dependency.dependencies')}}</h2>
                        <template s-for="item in dependencies">
                            <c-dependency-item item="{{item}}" on-pkgDelete="onPkgDelete"/>
                        </template>
                    </div>
                    <div class="pkg-body" s-if="devDependencies.length">
                        <h2>{{$t('dependency.devDependencies')}}</h2>
                        <template s-for="item in devDependencies">
                            <c-dependency-item item="{{item}}" on-pkgDelete="onPkgDelete"/>
                        </template>
                    </div>
                </div>
                <c-modal on-cancel="onModalClose" visible="{{modalVisible}}">
                    <template slot="content">
                        <c-dependency-search/>
                    </template>
                </c-modal>
            </div>
        </c-layout>
    `;

    static components = {
        's-button': Button,
        's-icon': Icon,
        'c-layout': Layout,
        'c-dependence-filter': DependencyFilter,
        'c-dependency-item': DependencyItem,
        'c-dependency-search': DependencySearch,
        'c-modal': Modal
    };

    static computed = {
        devDependencies() {
            return this.data.get('dependenciesList')
                .filter(item => {
                    const keyword = this.data.get('keyword') || '';
                    return item.type === 'devDependencies'
                        && (!keyword || ~item.id.indexOf(keyword));
                });
        },
        dependencies() {
            return this.data.get('dependenciesList')
                .filter(item => {
                    const keyword = this.data.get('keyword') || '';
                    return item.type === 'dependencies'
                        && (!keyword || ~item.id.indexOf(keyword));
                });
        },
        title() {
            return this.data.get('modalVisible')
                ? this.data.get('searchTitle') : this.data.get('homeTitle');
        }
    };

    initData() {
        return {
            keyword: '',
            dependenciesList: [],
            modalVisible: false,
            homeTitle: this.$t('dependency.title'),
            searchTitle: this.$t('dependency.searchTitle')
        };
    }

    async attached() {
        const dependencies = await this.getDependencies();
        // 使用队列来优化性能，并发量3
        const concurrency = 3;
        const queue = fastq(this, this.getDependencyItem, concurrency);
        dependencies.forEach(({id}, index) => {
            queue.push({id, index}, (err, data) => {
                if (err) {
                    throw err;
                }
                this.data.set(`dependenciesList[${index}].detail`, data);
            });
        });
    }

    async getDependencyItem({id, index}, callback) {
        const mutation = await this.$apollo.mutate({
            mutation: DEPENDENCY_ITEM,
            variables: {id}
        });

        const dependencyItem = mutation.data && mutation.data.dependencyItem;
        if (dependencyItem) {
            callback && callback(null, dependencyItem);
        }
    }

    keywordChange(keyword) {
        keyword = keyword.trim();
        this.data.set('keyword', keyword);
    }

    // 初始化获取数据列表
    async getDependencies() {
        const query = await this.$apollo.query({query: DEPENDENCIES});
        const dependencies = query.data ? query.data.dependencies : [];
        this.data.set('dependenciesList', dependencies);
        return dependencies;
    }

    // 搜索模态框取消
    onModalClose() {
        this.data.set('modalVisible', false);
        this.getDependencies();
    }

    // 搜索模态框展示
    onModalShow() {
        this.data.set('modalVisible', true);
    }

    // npm列表删除依赖包
    onPkgDelete() {
        this.getDependencies();
    }
}