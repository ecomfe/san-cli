/**
 * @file sidebar
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

import {Component} from 'san';
import html from '@sidebar';

export default class Sidebar extends Component {
    static template = /* html */ `
        <aside id="sidebar">
            {{html | raw}}
        </aside>
    `;
    initData() {
        return {html};
    }
}
