import './build-progress.less';

/* global SanComponent */
export default class BuildProgress extends SanComponent {
    static template = /* html */`
    <div class="build-progress">
        <s-progress
            strokeColor="#1db86d"
            type="circle"
            percent="{{data.progress || 0}}"
            width="{{175}}"
            strokeWidth="{{4}}"
            class="s-progress">
        </s-progress>
        <div class="extra-info">{{data.operations || 'idle'}}</div>
    </div>
    `;
};
