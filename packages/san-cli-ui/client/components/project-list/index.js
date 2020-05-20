/**
 * @file List组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_SET_FAVORITE from '@graphql/project/projectSetFavorite.gql';
import List from './ui-list';
import './index.less';
export default class ProjectList extends Component {

    static template = /* html */`
        <div class="project-list">
            <div s-if="!projects || projects.length <= 0">
                暂无数据
            </div>
            <template s-if="favoriteList && favoriteList.length > 0">
                <h3 class="favorite">我的收藏</h3>
                <c-list
                    list="{=favoriteList=}"
                    on-edit="onEdit"
                    on-open="onOpen"
                    on-delete="onDelete"
                    on-favorite="onFavorite"
                />
            </template>
            <template s-if="nomarlList && nomarlList.length > 0">
                <h3>项目列表</h3>
                <c-list
                    list="{=nomarlList=}"
                    on-edit="onEdit"
                    on-open="onOpen"
                    on-delete="onDelete"
                    on-favorite="onFavorite"
                />
            </template>
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
            loading: false
        };
    }

    static components = {
        'c-list': List
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
        // console.log('onEdit', e);
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
