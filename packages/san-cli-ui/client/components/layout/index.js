/**
 * @file 布局组件
 * @author zttonly
 */

import {Component} from 'san';
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
            <s-layout class="layout">
                <s-header class="header">
                    <s-dropdown trigger="click" class="project-name">
                        <s-menu slot="overlay"
                            selectable="{{false}}"
                            on-click="handleMenuClick"
                        >
                            <s-menuitem key="1">1st menu item</s-menuitem>
                            <s-menuitem key="2">2nd memu item</s-menuitem>
                            <s-menuitem key="3">3rd menu item</s-menuitem>
                        </s-menu>
                        <s-button>project name <s-icon type="down" /></s-button>
                    </s-dropdown>
                    <span class="title">{{title}}</span>
                    <div class="head-right">
                        <slot name="right"></slot>
                    </div>
                </s-header>

                <s-layout class="main-wrap">
                    <s-sider theme="light">
                        <s-menu class="menu" mode="inline" selectedKeys="{{nav}}">
                            <s-menuitem s-for="item in $t('detail.menu')" key="{{item.key}}">
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
            height: window.screen.availHeight,
            collapsed: false
        };
    }
    handleMenuClick(e) {
        // TODO: add content
        // console.log('click', e);
    }
}
