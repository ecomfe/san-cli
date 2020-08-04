/**
 * @file 任务仪表盘中的编译状态模块
 * @author Lohoyo
 */

import {Component} from 'san';
import './build-status-temp.less';
import {Grid} from 'santd';
import 'santd/es/grid/style';

export default class BuildStatus extends Component {
    static template = require('./build-status-temp.html');

    static components = {
        's-col': Grid.Col,
        's-row': Grid.Row
    };
};
