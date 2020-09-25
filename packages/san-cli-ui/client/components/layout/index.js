/**
 * @file 带侧边栏布局组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import ConnectionStatus from '@components/connection-status';
import HeaderTitle from './header-title';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';
import {Link} from 'san-router';
import './index.less';

export default class ComponentLayout extends Component {
    static template = /* html */`
            <s-layout class="h1oh layout">
                <c-connection-status></c-connection-status>
                <s-layout-header class="header">
                    <c-header-title title="{{title}}"></c-header-title>
                    <div class="head-right">
                        <slot name="right"></slot>
                    </div>
                </s-layout-header>

                <s-layout class="h1oh main-wrap">
                    <s-layout-sider class="sider" width="151">
                        <s-dropdown trigger="click" class="project-name-wrap">
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
                        <s-menu class="menu" mode="inline" selectedKeys="{{nav}}" theme="dark">
                            <s-menu-item s-for="item in $t('menu')" key="{{item.key}}">
                                <r-link to="{{item.link}}" class="{{item.key}}-icon">{{item.text}}</r-link>
                            </s-menu-item>
                        </s-menu>
                    </s-layout-sider>
                    <s-layout-content class="main">
                        <s-spin s-if="pageLoading"
                            class="loading"
                            spinning="{=pageLoading=}"
                            size="large"
                        >
                            <s-icon slot="indicator" type="loading" style="font-size: 30px;" />
                        </s-spin>
                        <slot name="content"></slot>
                    </s-layout-content>
                </s-layout>
            </s-layout>
    `;
    static components = {
        'c-connection-status': ConnectionStatus,
        'c-header-title': HeaderTitle,
        'r-link': Link
    };
    initData() {
        return {
            list: [],
            projectCurrent: {},
            pageLoading: false
        };
    }
    async inited() {
        this.getRecentProjectList();

        let projectCurrent = await this.$apollo.query({query: PROJECT_CURRENT});
        // 当前打开的project,记录在数据库
        projectCurrent.data && this.data.set('projectCurrent', projectCurrent.data.projectCurrent);
    }
    async getRecentProjectList() {
        const projects = await this.$apollo.query({query: PROJECTS});
        if (projects.data) {
            const projectsDuplicate = projects.data.projects.slice();
            // 之所以不直接对 projects.data.projects 进行 sort，是因为如果这里改了 projects.data.projects，还会影响其它用到了 projects.data.projects 的地方
            projectsDuplicate.sort((project1, project2) => project2.openDate - project1.openDate);
            this.data.set('list', projectsDuplicate.slice(1, 4));
        }
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

        let res = await this.$apollo.mutate({
            mutation: PROJECT_OPEN,
            variables: {
                id: e.key
            }
        });
        res.data && this.data.set('projectCurrent', res.data.projectOpen);

        this.getRecentProjectList();

        location.reload();
    }
}
