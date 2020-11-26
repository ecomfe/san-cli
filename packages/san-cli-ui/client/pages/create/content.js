/**
 * @file 创建项目
 */

import Component from '@lib/san-component';
import ProjectTemplateList from '@components/project/template-list';
import ProjectCreate from '@components/project/create';
import FolderExplorer from '@components/project/folder-explorer';
import CWD from '@graphql/cwd/cwd.gql';
import PROJECT_INIT_TEMPLATE from '@graphql/project/projectInitTemplate.gql';
import PROJECT_TEMPLATE_LIST from '@graphql/project/projectTemplateList.gql';
import './content.less';

export default class Project extends Component {
    static template = /* html */`
    <div class="h1oh project-container project-create">
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
                class="com-santd-btn-large create-project-start"
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
                class="com-santd-btn-large create-project-next"
                s-if="current === 1"
                size="large"
                on-click="handleInitProject"
                type="primary"
            >{{$t('next')}}</s-button>

            <s-button
                class="com-santd-btn-large create-project-submit"
                s-if="current === 2"
                size="large"
                on-click="createProject"
                type="primary"
            >{{$t('project.components.create.submitText')}}</s-button>
        </div>
    </div>
    `;

    static components = {
        'c-folder-explorer': FolderExplorer,
        'c-create': ProjectCreate,
        'c-project-template-list': ProjectTemplateList
    };

    initData() {
        return {
            cwd: '',
            projectPrompts: [],
            pageLoading: false,
            current: 0,
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

    handleCwdChange({path, isPackage}) {
        path && this.data.set('cwd', path);
        this.data.set('isPackage', isPackage);
    }

    formatPrompts(data) {
        data.forEach(item => {
            if (item.name === 'name') {
                // cli中的name是默认文件夹名称，web里面不能使用，故设置为空
                item.default = '';

                item.placeholder = this.$t('project.components.create.prompts.projectNamePlaceholder');
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
}
