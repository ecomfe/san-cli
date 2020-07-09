/**
 * @file 布局组件
 * @author zttonly
 */

import {Component} from 'san';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import {Layout, Icon, Menu, Dropdown, Button} from 'santd';
import {Link} from 'san-router';
import 'santd/es/layout/style';
import 'santd/es/menu/style';
import 'santd/es/icon/style';
import 'santd/es/dropdown/style';
import 'santd/es/button/style';
import './index.less';

export default class ComponentLayout extends Component {
    static template = /* html */`
            <s-layout class="inherit layout">
                <s-header class="header">
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

                <s-layout class="inherit flex-all main-wrap">
                    <s-sider theme="light">
                        <s-menu class="menu" mode="inline" selectedKeys="{{nav}}">
                            <s-menuitem s-for="item in $t('menu')" key="{{item.key}}">
                                <r-link to="{{item.link}}">
                                    <s-icon type="{{item.icon}}"></s-icon>
                                    <span>{{item.text}}</span>
                                </r-link>
                            </s-menuitem>
                        </s-menu>
                    </s-sider>
                    <s-content class="main">
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
        'r-link': Link
    };
    initData() {
        return {
            list: [],
            projectCurrent: {}
        };
    }
    inited() {
        this.getProjectList();
    }
    async getProjectList() {
        let projects = await this.$apollo.query({query: PROJECTS});
        projects.data && this.data.set('list', projects.data.projects);
        let projectCurrent = await this.$apollo.query({query: PROJECT_CURRENT});
        // 当前打开的project,记录在数据库
        projectCurrent.data && this.data.set('projectCurrent', projectCurrent.data.projectCurrent);
    }
    async handleMenuClick(e) {
        let res = await this.$apollo.mutate({
            mutation: PROJECT_OPEN,
            variables: {
                id: e.key
            }
        });
        res.data && this.data.set('projectCurrent', res.data.projectOpen);
    }
}
