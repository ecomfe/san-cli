/**
 * @file 自定义模态框
 * @author sunxiaoyu333
 */

import Component from '@lib/san-component';
import './dependency-modal.less';

export default class Modal extends Component {
    static template = /* html */`
        <div class="dependency-modal" s-if="{{visible}}" on-click="onClickOverlay">
            <div class="content" >
                <div class="modal-close" on-click="onCancel"></div>
                <slot name="content"></slot>
            </div>
        </div>
    `;
    initData() {
        return {
            visible: false
        };
    }

    onCancel() {
        this.data.set('visible', false);
        this.fire('cancel');
    }

    // 点击蒙层
    onClickOverlay(e) {
        if (e.target === e.currentTarget) {
            this.data.set('visible', false);
            this.fire('cancel');
        }
    }
}
