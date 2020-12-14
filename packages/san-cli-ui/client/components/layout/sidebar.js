/**
 * @file 项目详情页侧边栏
 */

import Component from '@lib/san-component';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';
import VIEWS from '@graphql/view/views.gql';
import './sidebar.less';
import {Modal} from 'santd';

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
        this.setProjectNav();
        this.setRecentProjects();
        this.setCurrentProject();
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
        const projectNav = (data.views || []).map(({id, name, icon}) => {
            const {
                text = name,
                type,
                // 如果link不存在，则表明是自定义视图
                link = `/addon/${id}`
            } = this.$t(`nav.${id}`) || {};
            return {id, text, type, link, name, icon};
        });
        this.data.set('projectNav', projectNav);
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
            if (res && res.data && res.data.projectOpenInEditor) {
                // 返回了错误信息
                Modal.error({
                    title: this.$t('dropdown.editorOpenFail'),
                    content: res.data.projectOpenInEditor
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
