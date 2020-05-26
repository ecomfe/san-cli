/**
 * @file 项目管理容器
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {router, Link} from 'san-router';
import {Icon, Button, Spin, Steps} from 'santd';
import {createApolloComponent} from '@lib/san-apollo';
import CWD from '@graphql/cwd/cwd.gql';
import PROJECT_INIT_TEMPLATE from '@graphql/project/projectInitTemplate.gql';
import PROJECT_IMPORT from '@graphql/project/projectImport.gql';
import ProjectList from '@components/project-list';
import FolderExplorer from '@components/folder-explorer';
import ProjectCreate from '@components/project-create';
import Layout from '@components/layout/horizontal';
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
            <c-layout menu="{{$t('project.select.menu')}}" nav="{=nav=}">
                <template slot="content">
                    <!--- 1.项目列表 -->
                    <c-list
                        s-if="route.path === '/' || route.query.nav === 'list'"
                        on-routeto="handleRouteTo"
                    />

                    <!--- 2.创建项目 -->
                    <div class="project-create" s-if="route.query.nav === 'create'">
                        <c-folder-explorer s-if="current === 0"
                            current-path="{{cwd}}"
                            on-change="handleCwdChange"
                        />
                        <c-create s-ref="create" prompts="{{projectPrompts}}" cwd="{{cwd}}" s-elif="current === 1"/>

                        <div class="footer-wrapper">
                            <s-button
                                class="custom-santd-btn"
                                size="large"
                                s-if="current === 0"
                                type="primary"
                                on-click="initProject"
                                icon="plus"
                            >{{$t('project.select.create.initProject')}}</s-button>
                            
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
                                loading="{{isImporting}}"
                                size="large"
                                icon="import"
                                s-if="current === 0"
                                type="primary"
                                on-click="importProject"
                            >{{$t('project.select.import.importBtnText')}}</s-button>
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
        'c-layout': Layout
    };
    initData() {
        return {
            cwd: '',
            projectPrompts: [],
            pageLoading: false,
            current: 0,
            stepsData: [],
            menuData: [],
            nav: [],
            isImporting: false,
            isPackage: false
        };
    }

    async attached() {
        let menuData = this.$t('project.select.menu');
        let queryNav = this.data.get('route.query.nav');
        this.data.set('stepsData', this.$t('project.select.create.steps'));
        this.data.set('menuData', menuData);
        this.data.set('nav', [queryNav || menuData[0].key]);
        // simple query demo
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
    }

    handleRouteTo(r) {
        r && router.locator.redirect(r);
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
        const {data} = await this.$apollo.mutate({
            mutation: PROJECT_INIT_TEMPLATE
        });
        this.data.set('pageLoading', false);
        if (data.projectInitTemplate && data.projectInitTemplate.prompts) {
            this.data.set('projectPrompts', this.formatPrompts(data.projectInitTemplate.prompts));
            this.data.set('current', this.data.get('current') + 1);
        };
    }

    createProject() {
        this.ref('create').submit();
    }

    cancelSubmit() {
        this.data.set('current', this.data.get('current') - 1);
    }

    async importProject() {
        this.data.set('isImporting', true);
        await this.$apollo.mutate({
            mutation: PROJECT_IMPORT,
            variables: {
                path: this.data.get('cwd'),
                force: false
            }
        });
        this.data.set('isImporting', false);
        // TODO: redirect to project page
        router.locator.redirect('/');
    }
}