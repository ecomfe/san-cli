/**
 * @file 仪表盘
 * @author zttonly
 */

import {Component} from 'san';
import {Button, Spin, Icon} from 'santd';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class Dashboard extends Component {
    static template = /* html */`
        <div class="dashboard">
            仪表盘
        </div>
    `;

    static components = {
    };

    initData() {
        return {
        };
    }

    attached() {
    }
}
