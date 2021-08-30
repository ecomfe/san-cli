
/* global SanComponent */
export default class BuildProgress extends SanComponent {
    static template = /* html */`
        <div class="{{styles.buildProgress}}">
            <s-progress
                strokeColor="#1db86d"
                type="circle"
                percent="{{data.progress || 0}}"
                width="{{175}}"
                strokeWidth="{{4}}"
                class="{{styles.sProgress}}">
            </s-progress>
            <div class="{{styles.extraInfo}}">{{data.operations || 'idle'}}</div>
        </div>
    `;
};
