/**
 * @file List组件
 * @author zttonly
 */

import Component from '@lib/san-component';
import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import PROJECT_SET_FAVORITE from '@graphql/project/projectSetFavorite.gql';
import PROJECT_RENAME from '@graphql/project/projectRename.gql';
import PROJECT_REMOVE from '@graphql/project/projectRemove.gql';
import PROJECT_CWD_RESET from '@graphql/project/projectCwdReset.gql';
import List from './list';
import 'animate.css';
import './project-list.less';


export default class ProjectList extends Component {

    static template = /* html */`
        <div class="project-list">
            <div s-if="!isLoaded" class="loading">
                <s-icon type="loading" />
            </div>
            <!---empty tip---->
            <div class="empty-tip" s-else-if="!projects || projects.length <= 0">
                <div>
                    <s-icon type="coffee" />
                    <p class="tip-text">{{$t('project.list.emptyTip')}}</p>
                </div>
            </div>

            <!---favorite list---->
            <template s-if="favoriteList && favoriteList.length > 0">
                <div class="favorite">
                    <h3>{{$t('project.list.collectionTitle')}}</h3>
                    <c-list
                        list="{=favoriteList=}"
                        on-edit="onEdit"
                        on-open="onOpen"
                        on-remove="onRemove"
                        on-favorite="onFavorite"
                        on-itemclick="onItemClick"
                        lastOpenProject="{=lastOpenProject=}"
                    />
                </div>
            </template>

            <!---all list---->
            <template s-if="nomarlList && nomarlList.length > 0">
                <h3 s-if="favoriteList && favoriteList.length > 0">{{$t('project.list.listTitle')}}</h3>
                <c-list
                    list="{=nomarlList=}"
                    on-edit="onEdit"
                    on-open="onOpen"
                    on-remove="onRemove"
                    on-favorite="onFavorite"
                    on-itemclick="onItemClick"
                    lastOpenProject="{=lastOpenProject=}"
                />
            </template>

            <s-modal wrap-class-name="rename-modal"
                width="580"
                title="{{$t('project.list.tooltip.rename')}}"
                visible="{=showRenameModal=}"
                okText="{{$t('project.list.modal.oktext')}}"
                on-ok="handleModalOk"
                on-cancel="handleModalCancel"
            >
                <p>{{$t('project.list.modal.tip')}}</p>
                <s-input placeholder="{{$t('project.list.modal.placeholder')}}"
                    value="{=projectName=}"
                    size="large"
                >
                    <s-icon type="folder" style="color: #1890ff;font-size:20px" theme="filled" slot="prefix" ></s-icon>
                </s-input>
            </s-modal>
        </div>
    `;
    static computed = {
        filterList() {
            let projects = this.data.get('projects');
            let filterInput = this.data.get('filterInput');
            return filterInput ? projects.filter(item => item.name.indexOf(filterInput) >= 0) : projects;
        },
        favoriteList() {
            let filterList = this.data.get('filterList');
            return filterList && filterList.filter(item => item.favorite);
        },
        nomarlList() {
            let filterList = this.data.get('filterList');
            return filterList && filterList.filter(item => !item.favorite);
        },
        lastOpenProject() {
            const projectCurrent = this.data.get('projectCurrent');
            return projectCurrent && projectCurrent.id;
        }
    };
    initData() {
        return {
            isLoaded: false,
            showRenameModal: false,
            projectName: '',
            editProject: ''
        };
    }

    static components = {
        'c-list': List
    }
    attached() {
        this.getProjects();
    }
    async getProjects() {
        let projects = await this.$apollo.query({query: PROJECTS});
        this.data.set('isLoaded', true);
        projects.data && this.data.set('projects', projects.data.projects);
        let projectCurrent = await this.$apollo.query({query: PROJECT_CURRENT});
        // 当前打开的project,记录在数据库
        projectCurrent.data && this.data.set('projectCurrent', projectCurrent.data.projectCurrent);
    }
    async onOpen({item}) {
        // todo: 与layout/index内方法整合到一起
        await this.$apollo.mutate({
            mutation: PROJECT_OPEN_IN_EDITOR,
            variables: {
                path: item.path
            }
        });
    }
    onEdit(e) {
        this.data.set('showRenameModal', true);
        this.data.set('editProject', e.item);
        this.data.set('projectName', e.item.name);
    }
    async handleModalOk() {
        const {editProject, projectName} = this.data.get();
        await this.$apollo.mutate({
            mutation: PROJECT_RENAME,
            variables: {
                id: editProject.id,
                name: projectName
            }
        });
        this.data.set('showRenameModal', false);
        this.getProjects();
    }
    handleModalCancel() {
        this.data.set('showRenameModal', false);
    }
    async onRemove(e) {
        let project = e.item;
        await this.$apollo.mutate({
            mutation: PROJECT_REMOVE,
            variables: {
                id: project.id
            },
            update: cache => {
                const data = cache.readQuery({query: PROJECTS});
                let projects = data.projects.filter(p => p.id === project.id);
                cache.writeQuery({query: PROJECTS, data: {projects}});
            }
        });
        this.getProjects();
    }
    async onFavorite(e) {
        await this.$apollo.mutate({
            mutation: PROJECT_SET_FAVORITE,
            variables: {
                id: e.item.id,
                favorite: e.item.favorite ? 0 : 1
            }
        });
        this.getProjects();
    }
    async onItemClick(e) {
        let projectCurrent = this.data.get('projectCurrent');
        if (!projectCurrent || projectCurrent.id !== e.item.id) {
            let res = await this.$apollo.mutate({
                mutation: PROJECT_OPEN,
                variables: {
                    id: e.item.id
                }
            });
            res.data && this.data.set('projectCurrent', res.data.projectOpen);
        }
        await this.$apollo.mutate({
            mutation: PROJECT_CWD_RESET
        });
        let r = this.$t('menu') ? this.$t('menu')[0].link : '';
        this.fire('routeto', r);
    }
}
