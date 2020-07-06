/**
 * @file 插件管理
 */
import {Component} from 'san';
import {Link} from 'san-router';
import {createApolloComponent} from '@lib/san-apollo';
import Layout from '@components/layout';

import './plugins.less';

export default class Plugins extends createApolloComponent(Component) {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['plugins']}}">
            <div slot="content">
                plugins
            </div>
        </c-layout>
    `;
    static components = {
        'c-layout': Layout
    };
}