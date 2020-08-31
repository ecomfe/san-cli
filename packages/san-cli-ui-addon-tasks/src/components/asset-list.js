import {bytes2kb} from '../utils/util';
import {getSpeeds} from '../utils/assets';
import './asset-list.less';

/* global SanComponent */
export default class AssetList extends SanComponent {
    static template = /* html */`
        <div class="asset-list">
            <s-grid-row class="first-row">
                <s-grid-col span="8"></s-grid-col>
                <s-grid-col span="4">Parsed</s-grid-col>
                <s-grid-col span="4">Global</s-grid-col>
                <s-grid-col span="4">3G Slow</s-grid-col>
                <s-grid-col span="4">3G Fast</s-grid-col>
            </s-grid-row>
            <s-grid-row s-for="item in assets">
                <s-grid-col span="8" class="first-col">{{item.name}}</s-grid-col>
                <s-grid-col span="4">{{item.size}}</s-grid-col>
                <s-grid-col span="4">{{item.globalSpeed}}</s-grid-col>
                <s-grid-col span="4">{{item['3gsSpeed']}}</s-grid-col>
                <s-grid-col span="4">{{item['3gfSpeed']}}</s-grid-col>
            </s-grid-row>
        </div>
        `;
    static computed = {
        assets() {
            const assetList = this.data.get('assetList') || [];
            return assetList.map(asset => {
                const speeds = getSpeeds(asset.size.gzip);
                return {
                    name: asset.name,
                    size: bytes2kb(asset.size.gzip),
                    globalSpeed: speeds.global.totalDownloadTime.toFixed(3) + 's',
                    '3gsSpeed': speeds['3gs'].totalDownloadTime.toFixed(3) + 's',
                    '3gfSpeed': speeds['3gf'].totalDownloadTime.toFixed(3) + 's'
                };
            });
        }
    }
};
