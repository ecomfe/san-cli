/**
 * @file 无侧边栏布局组件
 * @author zttonly
 */

import Component from '@lib/san-component';
import {router, Link} from 'san-router';
import ConnectionStatus from '@components/connection-status';
import './horizontal.less';
import logo from '@assets/logo.svg';

export default class ComponentHorLayout extends Component {
    static template = /* html */`
            <s-layout class="h1oh hlayout">
                <c-connection-status />
                <s-layout-header>
                    <div class="header">
                        <div class="title" on-click="logoClick">
                            <img src="{{logo}}" />
                            {{$t('title')}}
                        </div>
                        <s-menu theme="light"
                            mode="horizontal"
                            selectedKeys="{{nav}}"
                        >
                            <s-menu-item s-for="item in menu" key="{{item.key}}">
                                <r-link to="{{item.link}}">
                                    <s-icon type="{{item.icon}}" />
                                    <span>{{item.text}}</span>
                                </r-link>
                            </s-menu-item>
                        </s-menu>
                        <!---
                        <div class="head-right">
                            <r-link to="/about">
                                <s-icon type="question-circle"></s-icon>
                            </r-link>
                        </div>
                        --->
                    </div>
                </s-layout-header>
                <s-layout-content class="flex-all">
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
                </s-layout-content>
            </s-layout>
    `;
    static components = {
        'c-connection-status': ConnectionStatus,
        'r-link': Link
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
