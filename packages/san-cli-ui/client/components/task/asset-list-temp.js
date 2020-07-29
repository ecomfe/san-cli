/**
 * @file 任务仪表盘中的资源模块
 * @author Lohoyo<liuhuyue@baidu.com>
 */

import {Component} from 'san';
import './asset-list-temp.less';
import {Grid} from 'santd';
import 'santd/es/grid/style';

export default class BuildStatus extends Component {
    static template = require('./asset-list-temp.html');

    static components = {
        's-col': Grid.Col,
        's-row': Grid.Row
    };
};
