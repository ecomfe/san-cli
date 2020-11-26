/**
 * @file List组件
 * @author zttonly, Lohoyo
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
        <div class="project">
            <div s-if="!isLoaded" class="loading">
                <s-icon type="loading" />
            </div>

            <!---empty tip---->
            <div class="empty-tip" s-else-if="!projects || projects.length <= 0">
                {{$t('project.list.emptyTip')}}
                <s-router-link s-for="item, index in $t('project.select.menu')" to="{{item.link}}">
                    <s-button type="primary" ghost="{{index !== 0}}">{{item.text}}</s-button>
                </s-router-link>
            </div>

            <!---favorite list---->
            <div class="favorite container" s-if="favoriteList && favoriteList.length > 0">
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

            <!---Total list---->
            <div class="container project-list-container" s-if="nomarlList && nomarlList.length > 0">
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
            </div>

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
                    <s-icon type="folder" theme="filled" slot="prefix"></s-icon>
                </s-input>
            </s-modal>
        </div>
    `;

    static computed = {
        filterList() {
            const projects = this.data.get('projects');
            const filterInput = this.data.get('filterInput');
            return filterInput ? projects.filter(item => item.name.indexOf(filterInput) >= 0) : projects;
        },
        favoriteList() {
            return (this.data.get('filterList') || []).filter(item => item && item.favorite);
        },
        nomarlList() {
            return (this.data.get('filterList') || []).filter(item => item && !item.favorite);
        },
        lastOpenProject() {
            const {id} = this.data.get('projectCurrent') || {};
            return id;
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
        const projects = await this.$apollo.query({query: PROJECTS});
        this.data.set('isLoaded', true);
        projects.data && this.data.set('projects', projects.data.projects);
        const projectCurrent = await this.$apollo.query({query: PROJECT_CURRENT});
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
        const {id} = e.item;
        await this.$apollo.mutate({
            mutation: PROJECT_REMOVE,
            variables: {
                id
            },
            update: cache => {
                const data = cache.readQuery({query: PROJECTS});
                const projects = data.projects.filter(p => p.id === id);
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
        const projectCurrent = this.data.get('projectCurrent');
        if (!projectCurrent || projectCurrent.id !== e.item.id) {
            const res = await this.$apollo.mutate({
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

        const isSanProject = this.data.get('projectCurrent.type') === 'san';
        const link = isSanProject ? this.$t('nav.dashboard.link') : this.$t('nav.dependency.link');
        this.fire('routeto', link);
    }
}
