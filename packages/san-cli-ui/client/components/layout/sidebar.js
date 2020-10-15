/**
 * @file 项目详情页侧边栏
 */

import {Link} from 'san-router';
import Component from '@lib/san-component';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';
import VIEWS from '@graphql/view/views.gql';
import './sidebar.less';

export default class App extends Component {
    static template = /* html */`
        <s-layout-sider class="page-sidebar" width="151">
            <!---顶部下拉菜单--->
            <s-dropdown trigger="click" class="sidebar-dropdown">
                <s-menu
                    slot="overlay"
                    selectable="{{false}}"
                    on-click="handleMenuClick"
                    style="box-shadow: 0 2px 20px rgba(0, 0, 0 , .1); border-radius: 5px; width: 160px;">
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
                        key="{{item.name}}"
                    >
                        <r-link to="{{item.link}}" class="{{item.icon ? 'default' : item.name}}-icon">
                            <s-icon s-if="item.icon" type="{{item.icon}}"></s-icon>
                            {{item.text}}
                        </r-link>
                    </s-menu-item>
                </fragment>
            </s-menu>
        </s-layout-sider>
    `;

    static components = {
        'r-link': Link
    };

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

        this.data.set('selectedKeys', [this.data.get('nav')]);
    }

    async setProjectNav() {
        const {data} = await this.$apollo.query({query: VIEWS});
        const projectNav = (data.views || []).map(({id, name, icon}) => {
            const {
                text = name,
                type,
                link = `/project/addon_${id}`
            } = this.$t(`nav.${id}`) || {};
            return {text, type, link, name, icon};
        });

        this.data.set('projectNav', projectNav);
    }

    async handleMenuClick(e) {
        if (e.key === 'open-in-editor') {
            let path = this.data.get('projectCurrent.path');
            await this.$apollo.mutate({
                mutation: PROJECT_OPEN_IN_EDITOR,
                variables: {
                    path
                }
            });
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
