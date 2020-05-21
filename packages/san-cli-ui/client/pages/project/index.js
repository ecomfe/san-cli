/**
 * @file 项目管理容器
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {createApolloComponent, createApolloDataComponent} from '@lib/san-apollo';
import CWD from '@graphql/cwd/cwd.gql';
import PROJECT_INIT_TEMPLATE from '@graphql/project/projectInitTemplate.gql';
import PROJECT_IMPORT from '@graphql/project/projectImport.gql';
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

export default class App extends createApolloComponent(Component) {
    static template = /* html */`
        <div class="project-select">
            <s-spin class="loading" spinning="{{pageLoading}}" size="large">
                <s-icon slot="indicator" type="loading" style="font-size: 30px;" />
            </s-spin>
            <c-layout menu="{{$t('project.select.menu')}}" nav="{=nav=}" on-menuclick="handleMenu">
                <template slot="content">
                    <!--- 1.项目列表 -->
                    <c-list
                        s-if="route.path === '/' || route.query.nav === 'list'"
                        on-change="handleListChange"
                    />

                    <!--- 2.创建项目 -->
                    <div class="project-create" s-if="route.query.nav === 'create'">
                        <div class="steps-content">
                            <c-folder-explorer s-if="current === 0"
                                current-path="{{cwd}}"
                                on-change="handleCwdChange"
                            />
                            <c-create s-ref="create" prompts="{{projectPrompts}}" cwd="{{cwd}}" s-elif="current === 1"/>
                        </div>

                        <div class="footer-wrapper">
                            <s-button
                                class="custom-santd-btn"
                                size="large"
                                s-if="current === 0"
                                type="primary"
                                on-click="initProject"
                            >{{$t('project.select.create.initProject')}}<s-icon type="right" /></s-button>
                            
                            <s-button
                                class="custom-santd-btn"
                                s-if="current === 1"
                                size="large"
                                on-click="createProject"
                                type="primary"
                            >{{$t('project.components.create.submitText')}}</s-button>

                            <s-button type="link"
                                      size="large"
                                      class="cancel-submit"
                                      on-click="cancelSubmit"
                                      s-if="current === 1">
                                {{$t('project.components.create.cancelSubmitText')}}
                            </s-button>
                        </div>
                    </div>

                    <!--- 3.导入项目 -->
                    <div class="project-import" s-if="route.query.nav === 'import'">
                        <div class="steps-content">
                            <c-folder-explorer
                                current-path="{{cwd}}"
                                on-change="handleCwdChange"
                            />
                            
                            <div class="footer-wrapper">
                            <s-button
                                class="custom-santd-btn"
                                disabled="{{!isPackage}}"
                                size="large"
                                s-if="current === 0"
                                type="primary"
                                on-click="importProject"
                            >{{$t('project.select.import.importBtnText')}}<s-icon type="right" /></s-button>
                            </div>
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
            menuData: [],
            isPackage: true
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
    handleCwdChange({path, isPackage}) {
        // console.log('change', path);
        path && this.data.set('cwd', path);
        this.data.set('isPackage', isPackage);
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
    createProject() {
        this.ref('create').submit();
    }
    cancelSubmit() {
        this.data.set('current', this.data.get('current') - 1);
    }
    importProject() {
        this.data.set('pageLoading', true);
        this.$apollo.mutate({
            mutation: PROJECT_IMPORT,
            variables: {
                path: this.data.get('cwd'),
                force: false
            }
        }).then(({data}) => {
            this.data.set('pageLoading', false);
        });
    }
}
