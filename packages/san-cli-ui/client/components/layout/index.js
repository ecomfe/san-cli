/**
 * @file 布局组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {logo} from '../../const';
import {Layout, Icon, Menu} from 'santd';
import {Link} from 'san-router';
import 'santd/es/layout/style';
import 'santd/es/menu/style';
import 'santd/es/icon/style';
import './index.less';

export default class ComponentLayout extends Component {
    static template = /* html */`
        <div class="layout">
            <s-layout>
                <s-sider
                    theme="light"
                    collapsed="{{collapsed}}"
                    collapsible="{{true}}"
                    trigger="null"
                >
                    <div class="title">{{$t('title')}}</div>
                    <s-menu
                        mode="inline"
                        inlineCollapsed="{{collapsed}}"
                        selectedKeys="{{nav}}"
                    >
                        <s-menuitem s-for="item in menu" key="{{item.key}}">
                            <r-link to="{{item.link}}">
                                <s-icon type="{{item.icon}}" />
                                <span>{{item.text}}</span>
                            </r-link>
                        </s-menuitem>
                    </s-menu>
                </s-sider>
                <s-layout style="min-height: {{height}}px">
                    <s-header style="background: #fff; padding: 0">
                        <s-icon
                            class="trigger"
                            type="{{collapsed ? 'menu-unfold' : 'menu-fold'}}"
                            on-click="toggleCollapsed"
                        />
                        <div class="head-right">
                           <slot name="right"></slot>
                        </div>
                    </s-header>
                    <s-content class="main">
                        <slot name="content"></slot>
                    </s-content>
                </s-layout>
            </s-layout>
        </div>
    `;
    static components = {
        's-layout': Layout,
        's-header': Layout.Header,
        's-content': Layout.Content,
        's-sider': Layout.Sider,
        's-menu': Menu,
        's-menuitem': Menu.Item,
        's-icon': Icon,
        'r-link': Link
    };
    initData() {
        return {
            logo,
            title: 'San CLI',
            height: window.screen.availHeight,
            collapsed: false
        };
    }
    toggleCollapsed() {
        this.data.set('collapsed', !this.data.get('collapsed'));
    }
}
