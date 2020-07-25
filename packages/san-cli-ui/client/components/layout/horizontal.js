/**
 * @file 无侧边栏布局组件
 * @author zttonly
 */

import {Component} from 'san';
import {router, Link} from 'san-router';
import {Layout, Icon, Menu, Spin} from 'santd';
import 'santd/es/layout/style';
import 'santd/es/menu/style';
import 'santd/es/icon/style';
import 'santd/es/spin/style';
import './horizontal.less';
import logo from '@assets/logo.svg';

export default class ComponentHorLayout extends Component {
    static template = /* html */`
            <s-layout class="h1oh hlayout">
                <s-header>
                    <div class="header">
                        <div class="title" on-click="logoClick">
                            <img src="{{logo}}" />
                            {{$t('title')}}
                        </div>
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
                        <s-spin s-if="pageLoading"
                            class="loading"
                            spinning="{=pageLoading=}"
                            size="large"
                        >
                            <s-icon slot="indicator" type="loading" style="font-size: 30px;" />
                        </s-spin>
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
        's-spin': Spin,
        's-link': Link
    };
    initData() {
        return {
            logo,
            pageLoading: false
        };
    }
    logoClick() {
        router.locator.redirect('/');
    }
}
