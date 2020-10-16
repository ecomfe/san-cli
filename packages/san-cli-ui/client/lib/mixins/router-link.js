/**
 * @file 路由跳转组件
 * @author jinzhan
*/

import {Component} from 'san';
import {router} from 'san-router';

/**
 * 组件props
 *
 * @param {string} to 跳转的路由地址
 */
export default class RouterLink extends Component {
    static template = `
        <a on-click="routeTo"><slot /></a>
    `;
    routeTo() {
        const to = this.data.get('to');
        if (to) {
            router.locator.redirect(to);
        }
    }
};
