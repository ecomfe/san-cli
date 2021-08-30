import {getSpeeds} from '../../utils/assets';
/* global SanComponent */
export default class SpeedStatus extends SanComponent {
    static template = /* html */`
    <div class="{{styles.speedStats}}">
        <s-grid-row>
            <s-grid-col span="8" class="{{styles.item}}" s-for="item in speedStats">
                <div class="{{styles.pair}}">
                    <span class="{{styles.label}}">{{item.title}}</span>
                    <span class="{{styles.value}}">{{item.totalDownloadTime}}</span>
                </div>
            </s-grid-col>
        </s-grid-row>
        <div s-if="speedStats.length === 0">...</div>
    </div>
    `;
    static computed = {
        speedStats() {
            const size = this.data.get('computed.modulesPerSizeType[sizeType].modulesTotalSize');
            return size ? getSpeeds(size) : [];
        }
    };
};
