/**
 * @file 自定义模态框
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Icon} from 'santd';
import 'santd/es/icon/style';
import './modal.less';

export default class Modal extends Component {
    static template = /* html */`
        <div class="modal" s-if="{{visible}}" on-click="onClickOverlay">
            <div class="content" >
                <s-icon type="close" class="modal-close" on-click="onCancel"/>
                <slot name="content"></slot>
            </div>
        </div>
    `;
    initData() {
        return {
            visible: false
        };
    }

    static components = {
        's-icon': Icon
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
