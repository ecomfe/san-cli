/**
 * @file 项目容器组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {logo} from '../../const';
import CWD from '@graphql/cwd/cwd.gql';
import {Link} from 'san-router';
import {Button} from 'santd';
import {createApolloComponent} from '@lib/san-apollo';
import 'santd/es/button/style';
import './index.less';

export default class App extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="app" style="height: {{height}}px">
            <img class="logo" src="{{logo}}"/>
            <h1 class="title">{{$t('title')}}</h1>
            <div class="btn-group">
                <r-link to="/project/select">
                    <s-button type="primary">select san project</s-button>
                </r-link>
                <r-link to="/project/create">
                    <s-button type="primary">create san project</s-button>
                </r-link>
            </div>
        </div>
    `;
    static components = {
        'r-link': Link,
        's-button': Button
    };

    initData() {
        return {
            logo,
            cwd: '',
            height: window.screen.availHeight
        };
    }

    attached() {
        // simple query demo
        this.$apollo.query({query: CWD})
            .then(data => {
                this.data.set('cwd', data.data.cwd);
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.error(error);
            });
    }
}
