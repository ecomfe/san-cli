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
import {updateRecentProjects} from '@lib/utils/updateRecentProjects';

// 和视图不直接相关的数据
const projectMap = {};

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
                            <s-menuitem s-for="project in list" key="{{project.id}}">{{project.name}}</s-menuitem>
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
                            <s-menuitem s-for="item in $t('menu')" key="{{item.key}}">
                                <s-link to="{{item.link}}">
                                    <s-icon type="{{item.icon}}"></s-icon>
                                    <span>{{item.text}}</span>
                                </s-link>
                            </s-menuitem>
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
        's-menuitem': Menu.Item,
        's-dropdown': Dropdown,
        's-button': Button,
        's-icon': Icon,
        's-spin': Spin,
        's-link': Link
    };
    initData() {
        return {
            list: [],
            projectCurrent: {},
            pageLoading: false
        };
    }
    async inited() {
        const projects = await this.$apollo.query({query: PROJECTS});
        projects.data.projects.forEach((project) => {
            projectMap[project.id] = project;
        })
    
        this.getRecentProjectList();
    
        let projectCurrent = await this.$apollo.query({query: PROJECT_CURRENT});
        // 当前打开的project,记录在数据库
        projectCurrent.data && this.data.set('projectCurrent', projectCurrent.data.projectCurrent);
    }
    async getRecentProjectList() {
        const recentProjectIdList = JSON.parse(localStorage.getItem('recentProjects'));
        const recentProjectList = [];
        recentProjectIdList.forEach((id, index) => {
            recentProjectList[index] = projectMap[id];
        })
        this.data.set('list', recentProjectList);
    }
    async handleMenuClick(e) {
        const key = e.key;

        let res = await this.$apollo.mutate({
            mutation: PROJECT_OPEN,
            variables: {
                id: key
            }
        });
        res.data && this.data.set('projectCurrent', res.data.projectOpen);

        updateRecentProjects(key);
        this.getRecentProjectList();
    }
}
