/**
 * @file 任务仪表盘中的速度统计模块
 * @author Lohoyo
 */

import {Component} from 'san';
import './speed-stats-temp.less';
import {Grid} from 'santd';
import 'santd/es/grid/style';

export default class BuildStatus extends Component {
    static template = require('./speed-stats-temp.html');

    static components = {
        's-col': Grid.Col,
        's-row': Grid.Row
    };
};
