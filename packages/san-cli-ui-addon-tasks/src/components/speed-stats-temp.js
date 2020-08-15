/**
 * @file 任务仪表盘中的速度统计模块
 * @author Lohoyo
 */

import {Component} from 'san';
import './speed-stats-temp.less';
import {Grid} from 'santd';
import 'santd/es/grid/style';

export default class BuildStatus extends Component {
    static template = /* html */`
    <div class="speed-stats">
        <s-row gutter="80">
            <s-col span="8" class="item" s-for="item in speedStats">
                <span class="label">{{item.title}}</span><span>{{item.totalDownloadTime}}</span>
            </s-col>
        </s-row>
    </div>
    `;

    static components = {
        's-col': Grid.Col,
        's-row': Grid.Row
    };
};
