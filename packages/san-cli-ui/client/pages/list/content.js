/**
 * @file 用户添加的项目列表页
 * @author zttonly, Lohoyo
 */

import {router, Link} from 'san-router';
import {Modal} from 'santd';
import Component from '@lib/san-component';
import ProjectList from '@components/project/project-list';
import ProjectTemplateList from '@components/project/template-list';
import ProjectCreate from '@components/project/create';
import FolderExplorer from '@components/project/folder-explorer';
import CWD from '@graphql/cwd/cwd.gql';
import PROJECT_INIT_TEMPLATE from '@graphql/project/projectInitTemplate.gql';
import PROJECT_TEMPLATE_LIST from '@graphql/project/projectTemplateList.gql';
import PROJECT_IMPORT from '@graphql/project/projectImport.gql';
import './content.less';

export default class Project extends Component {
    static template = /* html */`
    <c-list
        on-routeto="handleRouteTo"
        filterInput="{{filterInput}}"
    />
    `;

    static components = {
        'r-link': Link,
        'c-list': ProjectList,
        'c-folder-explorer': FolderExplorer,
        'c-create': ProjectCreate,
        'c-project-template-list': ProjectTemplateList
    };

    $events() {
        return {
            filterInputChange(filterInput) {
                this.data.set('filterInput', filterInput);
            }
        };
    }

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
                title: this.$t('project.components.import.noModulesTips.title'),
                content: this.$t('project.components.import.noModulesTips.content')
            });
            return;
        }
        if (res.errors && res.errors.some(item => item.message === 'PROJECT_HAS_BEEN_IMPORTED')) {
            Modal.error({
                title: this.$t('project.components.import.hasBeenImportedTips.title'),
                content: this.$t('project.components.import.hasBeenImportedTips.content')
            });
            return;
        }
        router.locator.redirect('/');
    }
}
