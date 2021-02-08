/**
 * @file 项目详情页侧边栏
 */

import Component from '@lib/san-component';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';
import VIEWS from '@graphql/view/views.gql';
import VIEW_ADDED from '@graphql/view/viewAdded.gql';
import VIEW_REMOVED from '@graphql/view/viewRemoved.gql';
import './sidebar.less';
import {Modal} from 'santd';
import {NOTICE_CONFIG_URL} from '@lib/const';

/**
 * 组件props
 * @param {string} selectedMenu 选中的menu项id
 */
export default class App extends Component {
    static template = /* html */`
        <s-layout-sider class="page-sidebar" width="151">
            <!---顶部下拉菜单--->
            <s-dropdown trigger="click" class="sidebar-dropdown" overlayClassName="sidebar-dropdown-overlay">
                <s-menu
                    slot="overlay"
                    selectable="{{false}}"
                    on-click="handleMenuClick">
                    <s-menu-item key="open-in-editor">
                        <s-icon type="codepen"></s-icon>{{$t('dropdown.editor')}}
                    </s-menu-item>
                    <fragment s-if="list.length">
                        <s-menu-divider></s-menu-divider>
                        <s-menu-item-group title="{{$t('dropdown.recentProject')}}">
                            <s-menu-item s-for="project in list" key="{{project.id}}">
                                <s-icon type="history"></s-icon>{{project.name}}
                            </s-menu-item>
                        </s-menu-item-group>
                    </fragment>
                </s-menu>
                <div class="project-name">
                    {{projectCurrent.name}}<s-icon class="caret-down" type="caret-down" />
                </div>
            </s-dropdown>

            <!---详情页导航--->
            <s-menu class="sidebar-menu" mode="inline" selectedKeys="{{selectedKeys}}" theme="dark">
                <fragment s-for="item in projectNav">
                    <s-menu-item
                        s-if="projectCurrent.type !== 'unknown' || item.type === 'common')"
                        key="{{item.id}}"
                    >
                        <s-router-link to="{{item.link}}" class="{{item.icon ? 'default' : item.id}}-icon">
                            <s-icon s-if="item.icon" type="{{item.icon}}"></s-icon>
                            {{item.text}}
                        </s-router-link>
                    </s-menu-item>
                </fragment>
            </s-menu>

            <!---公告--->
            <div class="notice">
                <a s-for="item in notice" href="{{item.link}}" target="_blank">{{item.title}}</a>
            </div>
        </s-layout-sider>
    `;

    initData() {
        return {
            list: [],
            projectNav: [],
            projectCurrent: {},
            selectedKeys: []
        };
    }

    async inited() {
        await this.setCurrentProject();
        this.setRecentProjects();
        this.setProjectNav();
        fetch(NOTICE_CONFIG_URL).then(res => res.json()).then(res => {
            res && res.sidebarNotice && this.data.set('notice', res.sidebarNotice);
        });
    }

    async setCurrentProject() {
        const {data} = await this.$apollo.query({query: PROJECT_CURRENT});
        const projectCurrent = (data && data.projectCurrent) || {};
        this.data.set('projectCurrent', projectCurrent);
    }

    async setRecentProjects() {
        const {data} = await this.$apollo.query({query: PROJECTS});
        const projects = (data && data.projects) || [];

        // 获取排序后的项目
        const sortedProjects = [...projects].sort((p1, p2) => p2.openDate - p1.openDate);

        // 获取最近3个项目，不包括当前项目
        this.data.set('list', sortedProjects.slice(1, 4));

        this.data.set('selectedKeys', [this.data.get('selectedMenu')]);
    }

    async setProjectNav() {
        const {data} = await this.$apollo.query({query: VIEWS});
        const views  = (data.views || []).map(this.formatView.bind(this));
        this.fire('setviewname', views);
        this.data.set('projectNav', views);
        this.subscribeViewChange();
    }

    subscribeViewChange() {
        // 新增视图
        this.$apollo.subscribe({
            query: VIEW_ADDED
        }).subscribe({
            next: ({data}) => {
                if (data && data.viewAdded) {
                    const view = this.formatView(data.viewAdded);
                    const index = this.data.get('projectNav').findIndex(({id}) => id === view.id);
                    // 避免重复添加
                    if (index === -1) {
                        this.data.push('projectNav', view);
                    }
                }
                else {
                    console.log('VIEW_ADDED Error');
                }
            }
        });
        // 移除视图
        this.$apollo.subscribe({
            query: VIEW_REMOVED
        }).subscribe({
            next: ({data}) => {
                if (data && data.viewRemoved) {
                    const view = this.formatView(data.viewRemoved);
                    const index = this.data.get('projectNav').findIndex(({id}) => id === view.id);
                    if (~index) {
                        this.data.splice('projectNav', [index, 1]);
                    }
                }
                else {
                    console.log('VIEW_REMOVED Error');
                }
            }
        });
    }

    formatView({id, name, icon}) {
        const {
            text = name,
            type,
            // 如果link不存在，则表明是自定义视图
            link = `/addon/${id}`
        } = this.$t(`nav.${id}`) || {};
        return {id, text, type, link, name, icon};
    }

    async handleMenuClick(e) {
        if (e.key === 'open-in-editor') {
            const path = this.data.get('projectCurrent.path');
            const res = await this.$apollo.mutate({
                mutation: PROJECT_OPEN_IN_EDITOR,
                variables: {
                    path
                }
            });
            if (res && res.data && res.data.projectOpenInEditor && res.data.projectOpenInEditor.errMsg) {
                // 返回了错误信息
                Modal.error({
                    title: this.$t('common.openFail'),
                    content: res.data.projectOpenInEditor.errMsg
                });
            }
            return;
        }

        const {data} = await this.$apollo.mutate({
            mutation: PROJECT_OPEN,
            variables: {
                id: e.key
            }
        });

        this.data.set('projectCurrent', data ? data.projectOpen : {});

        this.setRecentProjects();

        // TODO: Async refreshing
        location.reload();
    }
}
