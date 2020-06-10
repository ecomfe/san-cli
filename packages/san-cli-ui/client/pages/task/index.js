/**
 * @file 任务管理
 */
import {Component} from 'san';
import {Link} from 'san-router';
import {createApolloComponent} from '@lib/san-apollo';
import CWD from '@graphql/cwd/cwd.gql';
import Layout from '@components/layout';
import Task from '@components/task';
import {Icon, Button, Spin} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class Detail extends createApolloComponent(Component) {
    static template = /* html */`
        <c-layout nav="{{['task']}}" title="{{$t('task.title')}}">
            <template slot="right"></template>
            <div slot="content">
                
            </div>
        </c-layout>
    `;
    static components = {
        's-icon': Icon,
        'r-link': Link,
        's-button': Button,
        's-spin': Spin,
        'c-layout': Layout,
        'c-task': Task
    };

    initData() {
        return {
            cwd: '',
            pageLoading: true
        };
    }

    async attached() {
        this.data.set('title', this.$t('detail.title'));
        // simple query demo
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
    }
}
