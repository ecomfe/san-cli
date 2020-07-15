/**
 * @file kill端口组件
 * @author zttonly
 */

import {Component} from 'san';

export default class KillPort extends Component {

    static template = /* html */`
        <div class="kill-port">
           kill-port
        </div>
    `;

    initData() {
        return {
        };
    }
    attached() {
        // eslint-disable-next-line no-console
        console.log('kill-port attached');
    }
}
