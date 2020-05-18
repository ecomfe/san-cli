/**
 * @file 项目管理容器
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {createApolloComponent, createApolloDataComponent} from '@lib/san-apollo';
import {
    CWD,
    PROJECT_INIT_CREATION
} from '../../const';
import ProjectList from '../../components/project-list';
import FolderExplorer from '../../components/folder-explorer';
import ProjectCreate from '../../components/project-create';
import Layout from '../../components/layout';
import {Link} from 'san-router';
import {Icon, Button, Spin} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class Select extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="project-select">
            <s-spin class="loading" spinning="{{pageLoading}}" size="large"/>
            <c-layout menu="{{menuData}}" nav="{=nav=}" on-menuclick="handleMenu">
                <template slot="right">
                    <r-link to="/">
                        首页
                    </r-link>
                    |
                    <r-link to="/about">
                        关于
                    </r-link>
                </template>
                <template slot="content">
                    <c-list
                        s-if="route.query.nav === 'select'"
                        loading="{{initLoading}}"
                        list="{=list=}"
                        on-change="handleListChange"
                    />
                    <div class="nav-folder" s-if="route.query.nav === 'path'">
                        <c-folder-explorer
                            current-path="{{cwd}}"
                            on-change="handleCwdChange"
                        />
                        <div class="actions-bar">
                            <s-button type="primary" icon="add" on-click="createProject">在此创建新目录</s-button>
                        </div>
                    </div>
                    <div class="nav-folder" s-if="route.query.nav === 'create'">
                        创建
                        <c-create />
                    </div>
                </template>
            </c-layout>
        </div>
    `;
    static components = {
        's-icon': Icon,
        'r-link': Link,
        's-button': Button,
        's-spin': Spin,
        'c-list': ProjectList,
        'c-folder-explorer': FolderExplorer,
        'c-create': ProjectCreate,
        'c-layout': Layout,
        'com-apollo': createApolloDataComponent(Component)
    };
    static computed = {
        nav() {
            let queryNav = this.data.get('route.query.nav');
            let menuNav = this.data.get('menuData')[0].key;
            return [queryNav || menuNav];
        }
    };
    initData() {
        return {
            menuData: [
                {text: '项目管理', icon: 'unordered-list', key: 'select', link: '/project/select'},
                {text: '目录切换', icon: 'swap', key: 'path', link: '/project/path'},
                {text: '创建项目', icon: 'plus', key: 'create', link: '/project/create'}
            ],
            CWD,
            title: 'San CLI',
            initLoading: true,
            list: [],
            defaultData: [
                {
                    title: 'test1',
                    dir: ''
                },
                {
                    title: 'test2',
                    dir: ''
                },
                {
                    title: 'test3',
                    dir: ''
                },
                {
                    title: 'test4',
                    dir: ''
                }
            ],
            noTrigger: null,
            collapsed: false,
            pageLoading: false
        };
    }


    async attached() {
        // simple query demo
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
        this.data.set('initLoading', false);
        const mockdir = this.data.get('cwd');
        const defaultData = this.data.get('defaultData');
        let list = defaultData.map(item => {
            item.loading = false;
            item.dir = mockdir;
            return item;
        });
        this.data.set('list', list);
    }
    toggleCollapsed() {
        this.data.set('collapsed', !this.data.get('collapsed'));
    }
    handleMenu(e) {
        this.data.set('nav', e.key);
    }
    handleListChange(e) {
    }
    handleCwdChange(path) {
        /* eslint-disable no-console */
        console.log('change', path);
        path && this.data.set('cwd', path);
    }
    async createProject() {
        let cwd = this.data.get('cwd');
        console.log('project create', cwd);
        // 开启loading 防止误点
        this.data.set('pageLoading', true);
        /* eslint-enable no-console */
        await this.$apollo.mutate({
            mutation: PROJECT_INIT_CREATION
        });
        this.data.set('pageLoading', true);
    }
}
