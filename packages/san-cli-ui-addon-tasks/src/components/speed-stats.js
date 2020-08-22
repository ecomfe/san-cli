import './speed-stats.less';

/* global SanComponent */
export default class SpeedStatus extends SanComponent {
    static template = /* html */`
    <div class="speed-stats">
        <s-row gutter="80">
            <s-col span="8" class="item" s-for="item in speedStats">
                <span class="label">{{item.title}}</span><span>{{item.totalDownloadTime}}</span>
            </s-col>
        </s-row>
    </div>
    `;
};
