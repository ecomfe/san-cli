/**
 * @file 任务仪表盘中的资源模块
 * @author Lohoyo
 */

import {Component} from 'san';
import './asset-list-temp.less';
import {Grid} from 'santd';
import 'santd/es/grid/style';

export default class BuildStatus extends Component {
    static template = /* html */`
    <div class="asset-list">
        <s-row class="first-row">
            <s-col span="8"></s-col>
            <s-col span="4">Parsed</s-col>
            <s-col span="4">Global</s-col>
            <s-col span="4">3G Slow</s-col>
            <s-col span="4">3G Fast</s-col>
        </s-row>
        <s-row s-for="item in assetList">
            <s-col span="8" class="first-col">{{item.name}}</s-col>
            <s-col span="4">{{item.size}}</s-col>
            <s-col span="4">{{item.globalTotalDownloadTime}}</s-col>
            <s-col span="4">{{item.3gsTotalDownloadTime}}</s-col>
            <s-col span="4">{{item.3gfTotalDownloadTime}}</s-col>
        </s-row>
    </div>
    `;

    static components = {
        's-col': Grid.Col,
        's-row': Grid.Row
    };
};
