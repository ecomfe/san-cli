/**
 * @file List组件
 * @author zttonly
 */

import {Component} from 'san';
import {Icon, Modal, Input} from 'santd';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';
import PROJECT_SET_FAVORITE from '@graphql/project/projectSetFavorite.gql';
import PROJECT_RENAME from '@graphql/project/projectRename.gql';
import PROJECT_REMOVE from '@graphql/project/projectRemove.gql';
import List from './list';
import 'santd/es/input/style';
import 'animate.css';
import './index.less';

export default class ProjectList extends Component {

    static template = /* html */`
        <div class="project-list">
            <!---empty tip---->
            <div class="empty-tip" s-if="!projects || projects.length <= 0">
                <div>
                    <s-icon type="coffee" />
                    <p class="tip-text">{{$t('project.list.emptyTip')}}</p>
                </div>
            </div>
            <div class="input-search" s-else>
                <s-input-search
                    placeholder="{{$t('project.list.searchPlaceholder')}}"
                    value="{=filterInput=}"
                    style="width: 400px;"
                    size="large"
                />
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
        }
    };
    initData() {
        return {
            showRenameModal: false,
            projectName: '',
            editProject: '',
            filterInput: ''
        };
    }

    static components = {
        's-icon': Icon,
        'c-list': List,
        's-modal': Modal,
        's-input': Input,
        's-input-search': Input.Search
    }
    attached() {
        this.projectApollo();
    }
    async projectApollo() {
        let projects = await this.$apollo.query({query: PROJECTS});
        projects.data && this.data.set('projects', projects.data.projects);
        let projectCurrent = await this.$apollo.query({query: PROJECT_CURRENT});
        // 当前打开的project,记录在数据库
        projectCurrent.data && this.data.set('projectCurrent', projectCurrent.data.projectCurrent);
    }
    onOpen({item}) {
        this.$apollo.mutate({
            mutation: PROJECT_OPEN_IN_EDITOR,
            variables: {
                path: item.path
            }
        }).then(({data}) => {
            /* eslint-disable no-console */
            console.log('PROJECT_OPEN_IN_EDITOR:', {data});
            /* eslint-enable no-console */
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
        this.projectApollo();
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
        this.projectApollo();
    }
    async onFavorite(e) {
        await this.$apollo.mutate({
            mutation: PROJECT_SET_FAVORITE,
            variables: {
                id: e.item.id,
                favorite: e.item.favorite ? 0 : 1
            }
        });
        this.projectApollo();
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
            res.data && this.data.set('projectCurrent', res.data.projectCurrent);
        }
        let r = this.$t('menu') ? this.$t('menu')[0].link : '';
        this.fire('routeto', r);
    }
}
