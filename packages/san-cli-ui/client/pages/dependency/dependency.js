/**
 * @file 依赖管理
 */
import {Component} from 'san';
import {createApolloComponent} from '@lib/san-apollo';
import Layout from '@components/layout';
import Dependency from '@components/dependency';
import './dependency.less';

export default class DependencyContainer extends createApolloComponent(Component) {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['dependency']}}">
            <div slot="content">
                <s-dependency/>
            </div>
        </c-layout>
    `;
    static components = {
        'c-layout': Layout,
        's-dependency': Dependency
    };
}