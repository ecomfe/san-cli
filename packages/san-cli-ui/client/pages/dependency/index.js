/**
 * @file 任务管理
 */
import {Component} from 'san';
import {Link} from 'san-router';
import {createApolloComponent} from '@lib/san-apollo';
import Layout from '@components/layout';
import ProjectRely from '@components/project-rely';

import './index.less';

export default class Dependency extends createApolloComponent(Component) {
    static template = /* html */`
        <c-layout menu="{{$t('menu')}}" nav="{{['dependency']}}" title="{{$t('dependency.title')}}">
            <div slot="content">
                <s-project-rely/>  
            </div>
        </c-layout>
    `;
    static components = {
        'c-layout': Layout,
        's-project-rely': ProjectRely
    };
}