/**
 * @file 插件管理
 */

import {Component} from 'san';
import {Icon} from 'santd';
import fastq from 'fastq';
import Layout from '@components/layout';
import DependencyItem from '@components/dependency/dependency-item';
import DEPENDENCY_ITEM from '@graphql/dependency/dependencyItem.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import './plugins.less';

export default class Plugins extends Component {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['plugins']}}" title="{{$t('plugins.title')}}">
            <div slot="content" class="plugins">
                <div class="pkg-body" s-if="pluginList.length">
                    <h2>{{$t('plugins.subTitle')}}</h2>
                    <c-dependency-item s-for="item in pluginList" item="{{item}}"/>
                </div>
                <div s-else class="empty-tip">
                    <div>
                        <s-icon type="api" />
                        <p class="tip-text">{{$t('plugins.emptyTip')}}</p>
                    </div>
                </div>
            </div>
        </c-layout>
    `;

    static components = {
        's-icon': Icon,
        'c-layout': Layout,
        'c-dependency-item': DependencyItem,
    };

    initData() {
        return {
            pluginList: []
        };
    }

    async attached() {
        const query = await this.$apollo.query({query: PLUGINS});
        const plugins = query.data ? query.data.plugins : [];
        this.data.set('pluginList', plugins);

        // 使用队列来优化性能，并发量3
        const concurrency = 3;
        const queue = fastq(this, this.getDependencyItem, concurrency);
        plugins.forEach(({id}, index) => {
            queue.push({id, index}, (err, data) => {
                if (err) {
                    throw err;
                }
                this.data.set(`pluginList[${index}].detail`, data);
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
}