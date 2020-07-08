/**
 * @file 仪表盘小部件列表
 * @author zttonly
 */

import {Component} from 'san';
import {Icon, Button} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';

export default class widgetList extends Component {

    static template = /* html */`
        <div s-if="realVisible"
            class="widget-list {{actived ? 'actived' : ''}} {{visible ? 'show' : 'hide'}}"
            on-transitionstart="onTransitionstart"
            on-transitionend="onTransitionend">
            widget-list
        </div>
    `;

    static computed = {
        realVisible() {
            const visible = this.data.get('visible');
            const isTransitionend = this.data.get('isTransitionend');
            return visible || isTransitionend;
        }
    };

    initData() {
        return {
            visible: false,
            isTransitionend: false,
            actived: false
        };
    }

    static components = {
        's-icon': Icon,
        's-button': Button
    }
    onTransitionstart() {
        this.data.set('isTransitionend', false);
    }
    onTransitionend() {
        const visible = this.data.get('visible');
        this.data.set('actived', visible);
        this.data.set('isTransitionend', true);
    }
}
