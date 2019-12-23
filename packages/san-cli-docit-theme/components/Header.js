/**
 * @file header
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

import {Component} from 'san';
import navHtml from '@navbar';
import sitedata from '@sitedata';
console.log(sitedata)

export default class Header extends Component {
    static template = /* html */ `
        <header id="header">
            <a href="/" class="logo">San Docit</a>
            {{nav | raw}}
        </header>
    `;
    initData() {
        return {nav: navHtml};
    }
}
