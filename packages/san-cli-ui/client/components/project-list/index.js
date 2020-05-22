/**
 * @file List组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {Icon, Modal, Input} from 'santd';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_SET_FAVORITE from '@graphql/project/projectSetFavorite.gql';
import List from './list';
import 'santd/es/input/style';
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
                        on-delete="onDelete"
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
                    on-delete="onDelete"
                    on-favorite="onFavorite"
                />
            </template>

            <s-modal title="{{$t('project.list.modal.title')}}"
                visible="{=showRenameModal=}"
                okText="{{$t('project.list.modal.oktext')}}"
                on-ok="handleModalOk"
                on-cancel="handleModalCancel"
            >
                <p>{{$t('project.list.modal.tip')}}</p>
                <s-input placeholder="{{$t('project.list.modal.placeholder')}}"
                    value="{=folderName=}"
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
        }
    };
    initData() {
        return {
            showRenameModal: false,
            folderName: ''
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
    onOpen(e) {
        // console.log('onOpen', e);
    }
    onEdit(e) {
        console.log('onEdit', e);
        this.data.set('showRenameModal', true);
        this.data.set('folderName', e.item.name);
    }
    handleModalOk() {
        this.data.set('showRenameModal', false);
    }
    handleModalCancel() {
        this.data.set('showRenameModal', false);
    }
    onDelete(e) {
        // console.log('onDelete', e);
    }
    async onFavorite(e) {
        // console.log('onFavorite', e);
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
