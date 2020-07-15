/**
 * @file 欢迎组件
 * @author zttonly
 */

import {Component} from 'san';

export default class Welcome extends Component {

    static template = /* html */`
        <div class="welcome">
           Welcome
        </div>
    `;

    initData() {
        return {
        };
    }
    attached() {
        // eslint-disable-next-line no-console
        console.log('welcome attached');
    }
}
