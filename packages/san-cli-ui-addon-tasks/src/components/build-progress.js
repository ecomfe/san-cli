import './build-progress.less';

/* global SanComponent */
export default class BuildProgress extends SanComponent {
    static template = /* html */`
    <div class="build-progress">
        <s-icon
            type="{{buildProgress.status === 'success' ? 'check-circle' : 'close-circle'}}"
            theme="twoTone"
            style="font-size: 140px;">
        </s-icon>
        <div class="extra-info">{{buildProgress.operations}}</div>
    </div>
    `;
};
