/**
 * @file 布局组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {logo} from '../../const';
import {Layout, Icon, Menu, Grid} from 'santd';
import {Link} from 'san-router';
import 'santd/es/layout/style';
import 'santd/es/menu/style';
import 'santd/es/grid/style';
import 'santd/es/icon/style';
import './horizontal.less';

export default class ComponentHorLayout extends Component {
    static template = /* html */`
        <div class="hlayout">
            <s-layout>
                <s-header>
                    <div class="header">
                        <div class="title" on-click="logoClick">{{$t('title')}}</div>
                        <s-menu
                            theme="light"
                            mode="horizontal"
                            selectedKeys="{{nav}}"
                        >
                            <s-menuitem s-for="item in menu" key="{{item.key}}">
                                <r-link to="{{item.link}}">
                                    <s-icon type="{{item.icon}}" />
                                    <span>{{item.text}}</span>
                                </r-link>
                            </s-menuitem>
                        </s-menu>
                        <div class="head-right">
                            <slot name="right"></slot>
                        </div>
                    </div>
                </s-header>
                <s-content style="min-height: {{height}}px;">
                    <div class="main">
                        <slot name="content"></slot>
                    </div>
                </s-content>
            </s-layout>
        </div>
    `;
    static components = {
        's-layout': Layout,
        's-header': Layout.Header,
        's-content': Layout.Content,
        's-menu': Menu,
        's-menuitem': Menu.Item,
        's-row': Grid.Row,
        's-col': Grid.Col,
        's-icon': Icon,
        'r-link': Link
    };
    initData() {
        return {
            logo,
            title: 'San CLI',
            height: window.screen.availHeight
        };
    }
    logoClick() {
        location.hash = '#/';
    }
}
