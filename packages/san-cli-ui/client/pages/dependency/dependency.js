/**
 * @file 任务管理
 */
import {Component} from 'san';
import {Link} from 'san-router';
import {createApolloComponent} from '@lib/san-apollo';
import Layout from '@components/layout';
import ProjectDependency from '@components/project-dependency';

import './dependency.less';

export default class Dependency extends createApolloComponent(Component) {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['dependency']}}">
            <div slot="content">
                <s-project-dependency/>
            </div>
        </c-layout>
    `;
    static components = {
        'c-layout': Layout,
        's-project-dependency': ProjectDependency
    };
}