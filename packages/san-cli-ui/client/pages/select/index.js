/**
 * @file 项目管理容器
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {createApolloComponent, createApolloDataComponent} from '@lib/san-apollo';
import CWD from '@graphql/cwd/cwd.gql';
import PROJECT_INIT_TEMPLATE from '@graphql/project/projectInitTemplate.gql';
import ProjectList from '@components/project-list';
import FolderExplorer from '@components/folder-explorer';
import ProjectCreate from '@components/project-create';
import Layout from '@components/layout/horizontal';
import {Link} from 'san-router';
import {Icon, Button, Spin, Steps} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import 'santd/es/steps/style';
import './index.less';

export default class Select extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="project-select">
            <s-spin class="loading" spinning="{{pageLoading}}" size="large">
                <s-icon slot="indicator" type="loading" style="font-size: 30px;" />
            </s-spin>
            <c-layout menu="{{$t('project.select.menu')}}" nav="{=nav=}" on-menuclick="handleMenu">
                <template slot="content">
                    <c-list
                        s-if="route.path === '/' || route.query.nav === 'select'"
                        on-change="handleListChange"
                    />
                    <div class="nav-create" s-if="route.query.nav === 'create'">
                         <s-steps current="{{current}}" s-if="stepsData.length">
                            <s-step s-for="step in stepsData" title="{{step}}" />
                        </s-steps>
                        <div class="steps-content">
                            <c-folder-explorer s-if="current === 0"
                                current-path="{{cwd}}"
                                on-change="handleCwdChange"
                            />
                            <c-create prompts="{{projectPrompts}}" cwd="{{cwd}}" s-elif="current === 1"/>
                        </div>
                        <div class="steps-action">
                            <s-button
                                s-if="current === 0"
                                type="primary"
                                icon="plus"
                                on-click="initProject"
                            >{{$t('project.select.create.stepsAction.initProject')}}</s-button>
                            <!---
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
                                >{{$t('project.select.create.stepsAction.createProject')}}</s-button>
                            ---->
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
            let menuNav = (this.data.get('menuData')[0] || {}).key;
            return [queryNav || menuNav];
        }
    };
    initData() {
        return {
            CWD,
            projectPrompts: [],
            pageLoading: false,
            current: 0,
            stepsData: [],
            menuData: []
        };
    }


    async attached() {
        this.data.set('stepsData', this.$t('project.select.create.steps'));
        this.data.set('menuData', this.$t('project.select.menu'));
        // simple query demo
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
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
            mutation: PROJECT_INIT_TEMPLATE
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
