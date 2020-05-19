/**
 * @file 项目管理容器
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {createApolloComponent, createApolloDataComponent} from '@lib/san-apollo';
import CWD from '@graphql/cwd/cwd.gql';
import PROJECT_INIT_TEMPLATE from '@graphql/project/projectInitTemplate.gql';
import view from '../../const/view';
import ProjectList from '@components/project-list';
import FolderExplorer from '@components/folder-explorer';
import ProjectCreate from '@components/project-create';
import Layout from '@components/layout';
import {Link} from 'san-router';
import {Icon, Button, Spin, Steps} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import 'santd/es/steps/style';
import './index.less';

const selectView = view.project.select;

export default class Select extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="project-select">
            <s-spin class="loading" spinning="{{pageLoading}}" size="large"/>
            <c-layout menu="{{menuData}}" nav="{=nav=}" on-menuclick="handleMenu">
                <template slot="right">
                    <r-link to="/">
                        {{headRight.home}}
                    </r-link>
                    |
                    <r-link to="/about">
                        {{headRight.about}}
                    </r-link>
                </template>
                <template slot="content">
                    <c-list
                        s-if="route.query.nav === 'select'"
                        loading="{{initLoading}}"
                        list="{=list=}"
                        on-change="handleListChange"
                    />
                    <div class="nav-create" s-if="route.query.nav === 'create'">
                         <s-steps current="{{current}}">
                            <s-step s-for="step in steps" title="{{step}}" />
                        </s-steps>
                        <div  class="steps-content">
                            <c-folder-explorer s-if="current === 0"
                                current-path="{{cwd}}"
                                on-change="handleCwdChange"
                            />
                            <c-create prompts="{{projectPrompts}}" s-elif="current === 1"/>
                        </div>
                        <div class="steps-action">
                            <s-button
                                s-if="current === 0"
                                type="primary"
                                icon="plus"
                                on-click="initProject"
                            >{{stepsAction.initProject}}</s-button>
                            <s-button
                                s-if="current > 0"
                                icon="left"
                                on-click="prev"
                            >{{stepsAction.prev}}</s-button>
                            <s-button
                                s-if="current === 1"
                                type="primary"
                                icon="check"
                                on-click="createProject"
                            >{{stepsAction.createProject}}</s-button>
                        </div>
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
        's-steps': Steps,
        's-step': Steps.Step,
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
            CWD,
            initLoading: true,
            list: [],
            projectPrompts: [],
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
            pageLoading: false,
            current: 0,
            // 文案合集
            menuData: selectView.menu,
            headRight: selectView.headRight,
            steps: selectView.create.steps,
            stepsAction: selectView.create.stepsAction
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
        // console.log('change', path);
        path && this.data.set('cwd', path);
    }

    formatPrompts(data) {
        data.forEach(item => {
            // 把default赋值给value
            item.default && (item.value = item.default);

            // 给select赋初始值
            item.choices && (item.value = item.choices[0].value);
        });
        return data;
    }

    async initProject() {
        this.data.set('pageLoading', true);
        this.$apollo.mutate({
            mutation: PROJECT_INIT_TEMPLATE,
        }).then(({data}) => {
            this.data.set('pageLoading', false);
            if (data.projectInitTemplate && data.projectInitTemplate.prompts) {
                this.data.set('projectPrompts', this.formatPrompts(data.projectInitTemplate.prompts));
                this.data.set('current', this.data.get('current') + 1);
            }
        });
    }
    async createProject() { // 配置确认后开始创建工程
    }
    prev() {
        const cur = +this.data.get('current');
        this.data.set('current', cur - 1);
    }
}
