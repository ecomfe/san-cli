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
                        <div class="head-right">
                            <div class="input-search" s-if="isList">
                                <s-input-search
                                    class="project-filter"
                                    placeholder="{{$t('project.list.searchPlaceholder')}}"
                                    size="large"
                                    on-change="filterInputChange">
                                </s-input-search>
                            </div>
                            <s-dropdown trigger="click" class="dropdown" placement="bottomCenter">
                                <s-menu
                                    slot="overlay"
                                    style="box-shadow: 0 2px 10px 3px #c8dBff; border-radius: 9px; width: 160px; background-color: #236eff;"
                                    selectable="{{false}}">
                                    <fragment s-for="item, index in menu">
                                        <s-menu-divider s-if="index !== 0" style="opacity: 0.3;"></s-menu-divider>
                                        <s-menu-item key="{{item.key}}">
                                            <r-link to="{{item.link}}" style="color: #fff; text-align: center; font-size: 20px;">
                                                <s-icon type="{{item.icon}}" style="font-size: 20px;"/>
                                                <span>{{item.text}}</span>
                                            </r-link>
                                        </s-menu-item>
                                    </fragment>
                                </s-menu>
                                <s-icon type="plus-circle" style="font-size: 36px; color: #236eff;"></s-icon>
                            </s-dropdown>
                            <!---
                            <r-link to="/about">
                                <s-icon type="question-circle"></s-icon>
                            </r-link>
                            --->
                        </div>
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
    filterInputChange(filterInput) {
        this.fire('filterInputChange', filterInput);
    }
}
