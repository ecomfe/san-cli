import {bytes2kb} from '../../utils/util';
import {getSpeeds} from '../../utils/assets';

/* global SanComponent */
export default class AssetList extends SanComponent {
    static template = /* html */`
        <div class="{{styles.assetList}}">
            <s-grid-row class="{{styles.firstRow}}" s-if="assets.length">
                <s-grid-col span="11"></s-grid-col>
                <s-grid-col span="4">{{sizeType}}</s-grid-col>
                <s-grid-col span="3">Global</s-grid-col>
                <s-grid-col span="3">3G Slow</s-grid-col>
                <s-grid-col span="3">3G Fast</s-grid-col>
            </s-grid-row>
            <s-grid-row s-for="item in assets">
                <s-grid-col span="11" class="{{styles.firstCol}}">{{item.name}}</s-grid-col>
                <s-grid-col span="4">{{item.size}}</s-grid-col>
                <s-grid-col span="3">{{item.globalSpeed}}</s-grid-col>
                <s-grid-col span="3">{{item['3gsSpeed']}}</s-grid-col>
                <s-grid-col span="3">{{item['3gfSpeed']}}</s-grid-col>
            </s-grid-row>
            <div s-if="!assets.length" class="{{styles.empty}}">...</div>
        </div>
        `;
    static computed = {
        assets() {
            const assetList = this.data.get('assetList') || [];
            const sizeType = this.data.get('sizeType');
            return assetList.map(asset => {
                const speeds = getSpeeds(asset.size[sizeType]);
                return {
                    name: asset.name,
                    size: bytes2kb(asset.size[sizeType]),
                    globalSpeed: speeds.global.totalDownloadTime,
                    '3gsSpeed': speeds['3gs'].totalDownloadTime,
                    '3gfSpeed': speeds['3gf'].totalDownloadTime
                };
            });
        }
    };
};
