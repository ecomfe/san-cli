import {getSpeeds} from '../utils/assets';
import './speed-stats.less';

/* global SanComponent */
export default class SpeedStatus extends SanComponent {
    static template = /* html */`
    <div class="speed-stats">
        <s-grid-row>
            <s-grid-col span="8" class="item" s-for="item in speedStats">
                <span class="label">{{item.title}}</span>
                <span class="value">{{item.totalDownloadTime}}</span>
            </s-grid-col>
        </s-grid-row>
    </div>
    `;
    static computed = {
        speedStats() {
            const size = this.data.get('computed.modulesPerSizeType.gzip.modulesTotalSize');
            return size ? getSpeeds(size) : [];
        }
    };
};
