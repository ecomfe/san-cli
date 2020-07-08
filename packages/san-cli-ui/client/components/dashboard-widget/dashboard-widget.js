/**
 * @file 仪表盘显示部件组件
 * @author zttonly
 */

import {Component} from 'san';
import {Icon, Button} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';

export default class DashboardWidget extends Component {

    static template = /* html */`
        <div class="dashboard-widget">
            {{widget}}
            <div s-if="custom">
                modal
            </div>
        </div>
    `;

    static computed = {
    };

    initData() {
        return {
        };
    }

    static components = {
        's-icon': Icon,
        's-button': Button
    }
}
