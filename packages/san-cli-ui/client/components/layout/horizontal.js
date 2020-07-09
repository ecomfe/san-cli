/**
 * @file 布局组件
 * @author zttonly
 */

import {Component} from 'san';
import {Layout, Icon, Menu} from 'santd';
import {router, Link} from 'san-router';
import 'santd/es/layout/style';
import 'santd/es/menu/style';
import 'santd/es/grid/style';
import 'santd/es/icon/style';
import './horizontal.less';

export default class ComponentHorLayout extends Component {
    static template = /* html */`
            <s-layout class="h1oh hlayout">
                <s-header>
                    <div class="header">
                        <div class="title" on-click="logoClick">{{$t('title')}}</div>
                        <s-menu theme="light"
                            mode="horizontal"
                            selectedKeys="{{nav}}"
                        >
                            <s-menuitem s-for="item in menu" key="{{item.key}}">
                                <s-link to="{{item.link}}">
                                    <s-icon type="{{item.icon}}" />
                                    <span>{{item.text}}</span>
                                </s-link>
                            </s-menuitem>
                        </s-menu>
                        <!---
                        <div class="head-right">
                            <r-link to="/about">
                                <s-icon type="question-circle"></s-icon>
                            </r-link>
                        </div>
                        --->
                    </div>
                </s-header>
                <s-content class="flex-all">
                    <div class="h1oh main">
                        <slot name="content"></slot>
                    </div>
                </s-content>
            </s-layout>
    `;
    static components = {
        's-layout': Layout,
        's-header': Layout.Header,
        's-content': Layout.Content,
        's-menu': Menu,
        's-menuitem': Menu.Item,
        's-icon': Icon,
        's-link': Link
    };
    initData() {
        return {
            height: window.screen.availHeight
        };
    }
    logoClick() {
        router.locator.redirect('/');
    }
}
