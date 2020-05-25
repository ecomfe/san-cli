/**
 * @file List组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {Icon, Modal, Input, Message} from 'santd';
import {isValidName} from '@lib/utils/folders';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';
import PROJECT_SET_FAVORITE from '@graphql/project/projectSetFavorite.gql';
import PROJECT_RENAME from '@graphql/project/projectRename.gql';
import PROJECT_REMOVE from '@graphql/project/projectRemove.gql';
import List from './list';
import 'santd/es/input/style';
import 'santd/es/message/style';
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
                    />
                </div>
            </template>

            <!---all list---->
            <template s-if="nomarlList && nomarlList.length > 0">
                <h3>{{$t('project.list.listTitle')}}</h3>
                <c-list
                    list="{=nomarlList=}"
                    on-edit="onEdit"
                    on-open="onOpen"
                    on-remove="onRemove"
                    on-favorite="onFavorite"
                />
            </template>

            <s-modal title="{{$t('project.list.tooltip.rename')}}"
                visible="{=showRenameModal=}"
                okText="{{$t('project.list.modal.oktext')}}"
                on-ok="handleModalOk"
                on-cancel="handleModalCancel"
            >
                <p>{{$t('project.list.modal.tip')}}</p>
                <s-input placeholder="{{$t('project.list.modal.placeholder')}}"
                    value="{=projectName=}"
                    class="rename-input"
                >
                    <s-icon type="folder" style="color: #1890ff;" theme="filled" slot="prefix" ></s-icon>
                </s-input>
            </s-modal>
        </div>
    `;
    static computed = {
        favoriteList() {
            let projects = this.data.get('projects');
            return projects && projects.filter(item => item.favorite);
        },
        nomarlList() {
            let projects = this.data.get('projects');
            return projects && projects.filter(item => !item.favorite);
        },
        newNameValid() {
            return isValidName(this.data.get('projectName'));
        }
    };
    initData() {
        return {
            showRenameModal: false,
            projectName: '',
            editProject: ''
        };
    }

    static components = {
        's-icon': Icon,
        'c-list': List,
        's-modal': Modal,
        's-input': Input
    }
    attached() {
        this.projectApollo();
    }
    async projectApollo() {
        let projects = await this.$apollo.query({query: PROJECTS});
        if (projects.data) {
            this.data.set('projects', projects.data.projects);
        }
    }
    onOpen({item}) {
        this.$apollo.mutate({
            mutation: PROJECT_OPEN_IN_EDITOR,
            variables: {
                path: item.path
            }
        }).then(({data}) => {
            console.log('PROJECT_OPEN_IN_EDITOR:', {data});
        });
    }
    onEdit(e) {
        this.data.set('showRenameModal', true);
        this.data.set('editProject', e.item);
        this.data.set('projectName', e.item.name);
    }
    async handleModalOk() {
        const {editProject, projectName, newNameValid} = this.data.get();
        if (!newNameValid) {
            Message.error(this.$t('project.list.modal.placeholder'));
            return;
        }
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
}
