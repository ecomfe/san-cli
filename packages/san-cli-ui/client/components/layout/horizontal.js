/**
 * @file 无侧边栏布局组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import {Link} from 'san-router';
import ConnectionStatus from '@components/connection-status';
import HeaderTitle from './header-title';
import './horizontal.less';

export default class ComponentHorLayout extends Component {
    static template = /* html */`
            <s-layout class="h1oh hlayout">
                <c-connection-status></c-connection-status>
                <s-layout-header>
                    <div class="header">
                        <c-header-title title="{{title}}"></c-header-title>
                        <div class="head-right">
                            <s-input-search
                                s-if="isList"
                                class="project-filter"
                                placeholder="{{$t('project.list.searchPlaceholder')}}"
                                size="large"
                                on-change="filterInputChange">
                            </s-input-search>
                            <s-dropdown trigger="click" class="dropdown" placement="bottomCenter">
                                <s-menu
                                    slot="overlay"
                                    style="box-shadow: 0 2px 10px 3px #c8dBff;
                                        border-radius: 9px;
                                        width: 160px;
                                        background-color: #236eff;"
                                    selectable="{{false}}">
                                    <fragment s-for="item, index in menu">
                                        <s-menu-divider s-if="index !== 0" style="opacity: 0.3;"></s-menu-divider>
                                        <s-menu-item key="{{item.key}}">
                                            <r-link to="{{item.link}}"
                                                style="color: #fff; text-align: center; font-size: 20px;">
                                                <s-icon type="{{item.icon}}" style="font-size: 20px;"></s-icon>
                                                <span>{{item.text}}</span>
                                            </r-link>
                                        </s-menu-item>
                                    </fragment>
                                </s-menu>
                                <s-button size="large" type="primary" shape="circle" icon="plus"/>
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
        'c-header-title': HeaderTitle,
        'r-link': Link
    };
    initData() {
        return {
            pageLoading: false
        };
    }
    filterInputChange(filterInput) {
        this.fire('filterInputChange', filterInput);
    }
}
