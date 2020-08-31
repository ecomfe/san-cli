import {getSpeeds} from '../utils/assets';
import './speed-stats.less';

/* global SanComponent */
export default class SpeedStatus extends SanComponent {
    static template = /* html */`
    <div class="speed-stats">
        <s-grid-row gutter="80">
            <s-grid-col span="8" class="item" s-for="item in speedStats">
                <span class="label">{{item.title}}</span><span>{{item.totalDownloadTime}}s</span>
            </s-grid-col>
        </s-grid-row>
    </div>
    `;
    static computed = {
        speedStats() {
            const data = this.data.get('modulesPerSizeType.gzip.modulesTotalSize') || [];
            return getSpeeds(data);
        }
    };
};
