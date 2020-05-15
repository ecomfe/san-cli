/**
 * @file 项目管理容器
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {createApolloComponent, createApolloDataComponent} from '@lib/san-apollo';
import {
    logo,
    CWD
} from '../../const';
import ProjectList from '../../components/project-list';
import FolderExplorer from '../../components/folder-explorer';
import {Link} from 'san-router';
import {Layout, Tabs, Icon, Button, Menu} from 'santd';
import 'santd/es/layout/style';
import 'santd/es/menu/style';
import 'santd/es/tabs/style';
import 'santd/es/button/style';
import './index.less';

export default class Select extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="project-select">
            <s-layout>
                <s-sider
                    theme="light"
                    collapsed="{{collapsed}}"
                    collapsible="{{true}}"
                    trigger="{{noTrigger}}"
                >
                    <div class="title"><img class="logo" src="{{logo}}"/> san项目管理</div>
                    <s-menu
                        mode="inline"
                        inlineCollapsed="{{collapsed}}"
                        defaultSelectedKeys="{{['1']}}"
                        on-click="handleMenu"
                    >
                        <s-menuitem key="1">
                            <s-icon type="unordered-list" />
                            <span>项目</span>
                        </s-menuitem>
                        <s-menuitem key="2">
                            <s-icon type="plus-circle" />
                            <span>创建</span>
                        </s-menuitem>
                    </s-menu>
                </s-sider>
                <s-layout>
                    <s-header style="background: #fff; padding: 0">
                        <s-icon
                            class="trigger"
                            type="{{collapsed ? 'menu-unfold' : 'menu-fold'}}"
                            on-click="toggleCollapsed"
                        />
                        <div class="head-right">
                            <r-link to="/">
                                首页
                            </r-link>
                            |
                            <r-link to="/about">
                                关于
                            </r-link>
                        </div>
                    </s-header>
                    <s-content class="main">
                        <c-list
                            s-if="nav === '1'"
                            loading="{{initLoading}}"
                            list="{=list=}"
                            on-change="handleListChange"
                        />
                        <div class="nav-folder" s-if="nav === '2'">
                            <c-folder-explorer
                                current-path="{{cwd}}"
                                on-change="handleCwdChange"
                            />
                            <div class="actions-bar">
                                <s-button type="primary" icon="add" on-click="createProject">在此创建新目录</s-button>
                            </div>
                        </div>
                    </s-content>
                </s-layout>
            </s-layout>
        </div>
    `;
    static components = {
        's-layout': Layout,
        's-header': Layout.Header,
        's-content': Layout.Content,
        's-sider': Layout.Sider,
        's-menu': Menu,
        's-submenu': Menu.Sub,
        's-menuitem': Menu.Item,
        's-tabs': Tabs,
        's-tabpane': Tabs.TabPane,
        's-icon': Icon,
        'r-link': Link,
        's-button': Button,
        'c-list': ProjectList,
        'c-folder-explorer': FolderExplorer,
        'com-apollo': createApolloDataComponent(Component)
    };
    static computed = {

    }

    initData() {
        return {
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
            logo,
            noTrigger: null,
            collapsed: false,
            nav: '1'
        };
    }


    async attached() {
        // simple query demo
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
        console.log(res);
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
    createProject() {
        let cwd = this.data.get('cwd');
        console.log('project create', cwd);
        /* eslint-enable no-console */
    }
}
