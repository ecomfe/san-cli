/**
 * @file 布局组件的头部标题组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import {router} from 'san-router';
import './header-title.less';
import logo from '@assets/logo.svg';

export default class HeaderTitle extends Component {
    static template = /* html */`
        <div class="header-title">
            <img src="{{logo}}" on-click="logoClick"/>{{title}}
        </div>
    `;
    initData() {
        return {
            logo
        };
    }
    logoClick() {
        router.locator.redirect('/');
    }
}
