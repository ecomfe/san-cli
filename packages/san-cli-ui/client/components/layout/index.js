/**
 * @file 带侧边栏布局组件
 * @author zttonly
 */

import {Component} from 'san';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import {Layout, Icon, Menu, Dropdown, Button, Spin} from 'santd';
import {Link} from 'san-router';
import 'santd/es/layout/style';
import 'santd/es/menu/style';
import 'santd/es/icon/style';
import 'santd/es/dropdown/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';
import {openInEditor} from '@lib/utils/openInEditor';

export default class ComponentLayout extends Component {
    static template = /* html */`
            <s-layout class="h1oh layout">
                <s-header class="header">
                    <s-link to="/">
                        <s-icon type="home" class="home-link" />
                    </s-link>
                    <s-dropdown trigger="click" class="project-name">
                        <s-menu slot="overlay"
                            selectable="{{false}}"
                            on-click="handleMenuClick"
                        >
                            <s-menu-item key="open-in-editor">在编辑器中打开</s-menu-item>
                            <s-menu-divider></s-menu-divider>
                            <s-menu-item s-for="project in list" key="{{project.id}}">{{project.name}}</s-menu-item>
                        </s-menu>
                        <s-button>{{projectCurrent.name}}<s-icon type="down" /></s-button>
                    </s-dropdown>
                    <span class="line"></span>
                    <h1 class="title">{{title}}</h1>
                    <div class="head-right">
                        <slot name="right"></slot>
                    </div>
                </s-header>

                <s-layout class="h1oh flex-all main-wrap">
                    <s-sider theme="light">
                        <s-menu class="menu" mode="inline" selectedKeys="{{nav}}">
                            <s-menu-item s-for="item in $t('menu')" key="{{item.key}}">
                                <s-link to="{{item.link}}">
                                    <s-icon type="{{item.icon}}"></s-icon>
                                    <span>{{item.text}}</span>
                                </s-link>
                            </s-menu-item>
                        </s-menu>
                    </s-sider>
                    <s-content class="main">
                        <s-spin s-if="pageLoading"
                            class="loading"
                            spinning="{=pageLoading=}"
                            size="large"
                        >
                            <s-icon slot="indicator" type="loading" style="font-size: 30px;" />
                        </s-spin>
                        <slot name="content"></slot>
                    </s-content>
                </s-layout>
            </s-layout>
    `;
    static components = {
        's-layout': Layout,
        's-header': Layout.Header,
        's-content': Layout.Content,
        's-sider': Layout.Sider,
        's-menu': Menu,
        's-menu-item': Menu.Item,
        's-dropdown': Dropdown,
        's-button': Button,
        's-icon': Icon,
        's-spin': Spin,
        's-link': Link,
        's-menu-divider': Menu.MenuDivider,
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
            projects.data.projects.sort((project1, project2) => project2.openDate - project1.openDate);
            this.data.set('list', projects.data.projects.slice(0, 3));
        }
    }
    async handleMenuClick(e) {
        if (e.key === 'open-in-editor') {
            openInEditor.call(this, this.data.get('projectCurrent.path'));
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
    }
}
