/**
 * @file 任务仪表盘中的编译进度模块
 * @author Lohoyo
 */

import {Component} from 'san';
import './build-progress-temp.less';
import {Icon} from 'santd';
import 'santd/es/icon/style';

export default class BuildStatus extends Component {
    static template = /* html */`
    <div class="build-progress">
        <s-icon
            type="{{buildProgress.status === 'success' ? 'check-circle' : 'close-circle'}}"
            theme="twoTone"
            style="font-size: 140px;">
        </s-icon>
        <div class="extra-info">{{buildProgress.operations}}</div>
    </div>
    `;

    static components = {
        's-icon': Icon
    };
};
