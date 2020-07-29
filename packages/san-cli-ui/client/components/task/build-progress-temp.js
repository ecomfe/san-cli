/**
 * @file 任务仪表盘中的编译进度模块
 * @author Lohoyo<liuhuyue@baidu.com>
 */

import {Component} from 'san';
import './build-progress-temp.less';
import {Icon} from 'santd';
import 'santd/es/icon/style';

export default class BuildStatus extends Component {
    static template = require('./build-progress-temp.html');

    static components = {
        's-icon': Icon
    };
};
