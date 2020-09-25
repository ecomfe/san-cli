/**
 * @file 项目管理容器
 * @author zttonly, Lohoyo
 */

import {router, Link} from 'san-router';
import {Modal} from 'santd';
import Component from '@lib/san-component';
import ProjectList from '@components/project/project-list';
import ProjectTemplateList from '@components/project/template-list';
import ProjectCreate from '@components/project/create';
import FolderExplorer from '@components/project/folder-explorer';
import Layout from '@components/layout/horizontal';
import CWD from '@graphql/cwd/cwd.gql';
import PROJECT_INIT_TEMPLATE from '@graphql/project/projectInitTemplate.gql';
import PROJECT_TEMPLATE_LIST from '@graphql/project/projectTemplateList.gql';
import PROJECT_IMPORT from '@graphql/project/projectImport.gql';
import './project.less';

export default class Project extends Component {
    static template = /* html */`
        <div class="h1oh project-select">
            <c-layout menu="{{$t('project.select.menu')}}"
                page-loading="{{pageLoading}}"
                isList="{{route.path === '/' || route.query.nav === 'list'}}"
                on-filterInputChange="filterInputChange"
                title="{{$t('title.' + route.query.nav) || $t('title.list')}}"
            >
                <template slot="content">
                    <!--- 1.项目列表 -->
                    <c-list
                        s-if="route.path === '/' || route.query.nav === 'list'"
                        on-routeto="handleRouteTo"
                        filterInput="{{filterInput}}"
                    />

                    <!--- 2.创建项目 -->
                    <div class="h1oh project-create" s-if="route.query.nav === 'create'">
                        <c-folder-explorer
                            s-if="current === 0"
                            current-path="{{cwd}}"
                            on-change="handleCwdChange"
                        />
                        <c-project-template-list 
                            s-elif="current === 1"
                            s-ref="projectTemplates"
                            on-submit="initProject"
                            hide-submit-btn="{{true}}"
                            current-template="{{projectTemplateList.length ? projectTemplateList[0].value : ''}}"
                            project-template-list="{{projectTemplateList}}"
                        />
                        <c-create 
                            s-elif="current === 2"
                            s-ref="create"
                            prompts="{{projectPrompts}}"
                            cwd="{{cwd}}"
                        />

                        <!---底部按钮--->
                        <div class="flex-none footer-wrapper">
                            <s-button
                                class="custom-santd-btn"
                                size="large"
                                s-if="current === 0"
                                type="primary"
                                on-click="getProjectTemplateList"
                            >{{$t('project.select.create.initProject')}}</s-button>
                            
                            <!----上一步---->
                            <s-button
                                s-if="current > 0"
                                type="link"
                                size="large"
                                class="cancel-submit"
                                on-click="cancelSubmit"
                            >{{$t('pre')}}</s-button>

                            <!----下一步---->
                            <s-button
                                class="custom-santd-btn"
                                s-if="current === 1"
                                size="large"
                                on-click="handleInitProject"
                                type="primary"
                            >{{$t('next')}}</s-button>

                            <s-button
                                class="custom-santd-btn"
                                s-if="current === 2"
                                size="large"
                                on-click="createProject"
                                type="primary"
                            >{{$t('project.components.create.submitText')}}</s-button>
                        </div>
                    </div>

                    <!--- 3.导入项目 -->
                    <div class="h1oh project-import" s-if="route.query.nav === 'import'">
                        <c-folder-explorer
                            current-path="{{cwd}}"
                            on-change="handleCwdChange"
                        />
                        <div class="flex-none footer-wrapper">
                            <s-button
                                class="custom-santd-btn"
                                disabled="{{!isPackage}}"
                                loading="{{isImporting}}"
                                size="large"
                                s-if="current === 0"
                                type="primary"
                                on-click="importProject"
                            >{{$t('project.select.import.importBtnText')}}</s-button>
                        </div>
                    </div>
                </template>
            </c-layout>
        </div>
    `;
    static components = {
        'r-link': Link,
        'c-list': ProjectList,
        'c-folder-explorer': FolderExplorer,
        'c-create': ProjectCreate,
        'c-layout': Layout,
        'c-project-template-list': ProjectTemplateList
    };
    initData() {
        return {
            cwd: '',
            projectPrompts: [],
            pageLoading: false,
            current: 0,
            isImporting: false,
            isPackage: false,
            projectTemplateList: [],
            projectTemplate: ''
        };
    }

    async attached() {
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
    }

    handleRouteTo(r) {
        r && router.locator.redirect(r);
    }

    handleCwdChange({path, isPackage}) {
        path && this.data.set('cwd', path);
        this.data.set('isPackage', isPackage);
    }

    formatPrompts(data) {
        data.forEach(item => {
            // cli中的name是默认文件夹名称，web里面不能使用，故设置为空
            if (item.name === 'name') {
                item.default = '';
            }

            // 把default赋值给value
            item.default && (item.value = item.default);

            // 给select赋初始值
            item.choices && (item.value = item.choices[0].value);
        });
        return data;
    }

    // 获取可选的脚手架
    async getProjectTemplateList() {
        this.data.set('pageLoading', true);
        const {data} = await this.$apollo.query({
            query: PROJECT_TEMPLATE_LIST
        });
        this.data.set('pageLoading', false);
        this.data.set('current', this.data.get('current') + 1);
        this.data.set('projectTemplateList', data.projectTemplateList);
    }

    async initProject(template) {
        this.data.set('pageLoading', true);
        const {data} = await this.$apollo.mutate({
            mutation: PROJECT_INIT_TEMPLATE,
            variables: {
                template
            }
        });
        this.data.set('pageLoading', false);
        if (data.projectInitTemplate && data.projectInitTemplate.prompts) {
            // 存储起来，create项目的时候要用
            this.data.set('projectTemplate', template);
            this.data.set('projectPrompts', this.formatPrompts(data.projectInitTemplate.prompts));
            this.data.set('current', this.data.get('current') + 1);
        }
    }

    handleInitProject() {
        this.ref('projectTemplates').handleSubmit();
    }

    createProject() {
        this.ref('create').submit({
            template: this.data.get('projectTemplate')
        });
    }

    cancelSubmit() {
        this.data.set('current', this.data.get('current') - 1);
    }

    async importProject() {
        this.data.set('isImporting', true);
        const res = await this.$apollo.mutate({
            mutation: PROJECT_IMPORT,
            variables: {
                path: this.data.get('cwd'),
                force: false
            }
        });
        this.data.set('isImporting', false);
        if (res.errors && res.errors.some(item => item.message === 'NO_MODULES')) {
            Modal.error({
                title: this.$t('project.components.import.noModulesTipsTitle'),
                content: this.$t('project.components.import.noModulesTipsContent')
            });
            return;
        }
        router.locator.redirect('/');
    }

    filterInputChange(filterInput) {
        this.data.set('filterInput', filterInput);
    }
}
