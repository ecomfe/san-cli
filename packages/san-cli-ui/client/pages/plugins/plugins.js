/**
 * @file 插件管理
 */

import {Component} from 'san';
import {Icon} from 'santd';
import Layout from '@components/layout';
import DependencyItem from '@components/dependency/dependency-item';
import PLUGINS from '@graphql/plugin/plugins.gql';
import './plugins.less';

export default class Plugins extends Component {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['plugins']}}" title="{{$t('plugins.title')}}">
            <div slot="content" class="plugins">
                <div class="pkg-body" s-if="list.length">
                    <h2>{{$t('plugins.subTitle')}}</h2>
                    <c-dependency-item s-for="item in list" item="{{item}}"/>
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
            // TODO:
        };
    }

    async attached() {
        const query = await this.$apollo.query({query: PLUGINS});
        if (query.data && query.data.plugins) {
            this.data.set('list', query.data.plugins);
        }
    }
}