import './build-progress.less';

/* global SanComponent */
export default class BuildProgress extends SanComponent {
    static template = /* html */`
    <div class="build-progress">
        <s-progress 
            type="circle"
            percent="{{data.progress || 0}}"
            />
        <div class="extra-info">{{data.operations}}</div>
    </div>
    `;
};
