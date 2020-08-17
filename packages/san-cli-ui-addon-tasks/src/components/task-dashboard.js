/**
 * @file 任务仪表盘
 * @author Lohoyo
 */

import {Component} from 'san';
import './task-dashboard.less';
import {Grid, Card} from 'santd';
import 'santd/es/grid/style';
import 'santd/es/card/style';
import BuildStatus from './build-status-temp';
import BuildProgress from './build-progress-temp';
import SpeedStats from './speed-stats-temp';
import AssetList from './asset-list-temp';
import ModuletList from './module-list-temp';

export default class TaskDashboard extends Component {
    static template = /* html */`
    <div class="task-dashboard">
        <s-row class="row" gutter="16">
            <s-col span="16">
                <s-card bordered="{{false}}" class="card">
                    <c-build-status buildStatus="{{buildStatus}}"></c-build-status>
                </s-card>
            </s-col>
            <s-col span="8">
                <s-card bordered="{{false}}" class="card">
                    <c-build-progress buildProgress="{{buildProgress}}"></c-build-progress>
                </s-card>
            </s-col>
        </s-row>
        <s-row class="row">
            <s-col span="24">
                <s-card bordered="{{false}}" class="card" title="速度统计">
                    <c-speed-stats speedStats="{{speedStats}}"></c-speed-stats>
                </s-card>
            </s-col>
        </s-row>
        <s-row class="row" gutter="16">
            <s-col span="16">
                <s-card bordered="{{false}}" class="card" title="资源">
                    <c-asset-list assetList="{{assetList}}"></c-asset-list>
                </s-card>
            </s-col>
            <s-col span="8">
                <s-card bordered="{{false}}" class="card" title="依赖项">
                    <c-module-list moduletList="{{moduletList}}"></c-module-list>
                </s-card>
            </s-col>
        </s-row>
    </div>
    `;

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
};
