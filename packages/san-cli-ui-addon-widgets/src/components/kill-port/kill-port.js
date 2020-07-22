/**
 * @file kill端口组件
 * @author zttonly
 */

import {Component} from 'san';
import {Icon, Button, InputNumber} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/input-number/style';
import './kill-port.less';

export default class KillPort extends Component {

    static template = /* html */`
        <div class="kill-port">
            <div class="status status-{{status}}">
                <s-icon type="{{icons[status]}}"/>
                <div class="info">{{state.status}}</div>
            </div>
            <div class="actions">
                <s-input-number
                    min="0" 
                    max="9999"
                    value="{=inputPort=}"
                    size="large"
                    on-change="onChange"
                ></s-input-number>
                <s-button class="huge" type="primary" value="large">
                    <s-icon type="thunderbolt" theme="filled"/>{{state.kill}}
                </s-button>
            </div>
        </div>
    `;
    static components = {
        's-icon': Icon,
        's-button': Button,
        's-input-number': InputNumber
    };
    static computed = {
        state() {
            const text = this.data.get('text');
            if (!text) {
                return;
            }
            const v = text['kill-port'];
            const status = this.data.get('status');
            return {
                status: v.status[status],
                placeholder: v.input.placeholder,
                kill: v.kill
            };
        }
    };
    initData() {
        return {
            status: 'idle',
            icons: {
                idle: 'thunderbolt',
                killed: 'check-circle',
                error: 'exclamation-circle'
            },
            inputPort: 0
        };
    }
    attached() {
        // eslint-disable-next-line no-console
        console.log('kill-port attached', this.data.get());
    }
    onChange() {
        // eslint-disable-next-line no-console
        console.log('number');
    }
}
