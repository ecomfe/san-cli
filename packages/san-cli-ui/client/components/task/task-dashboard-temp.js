/**
 * @file 任务仪表盘
 * @author Lohoyo<liuhuyue@baidu.com>
 */

import {Component} from 'san';
import './task-dashboard-temp.less';
import {Grid, Card} from 'santd';
import 'santd/es/grid/style';
import 'santd/es/card/style';
import BuildStatus from './build-status-temp';
import BuildProgress from './build-progress-temp';
import SpeedStats from './speed-stats-temp';
import AssetList from './asset-list-temp';
import ModuletList from './module-list-temp';
import taskDashboardData from './task-dashboard-data.json';

export default class TaskDashboard extends Component {
    static template = require('./task-dashboard-temp.html');

    static components = {
        's-col': Grid.Col,
        's-row': Grid.Row,
        's-card': Card,
        'c-build-status': BuildStatus,
        'c-build-progress': BuildProgress,
        'c-speed-stats': SpeedStats,
        'c-asset-list': AssetList,
        'c-module-list': ModuletList
    };

    initData() {
        const {buildStatus, buildProgress, speedStats, assetList, moduletList} = taskDashboardData;
        return {
            buildStatus,
            buildProgress,
            speedStats,
            assetList,
            moduletList
        };
    }
};
