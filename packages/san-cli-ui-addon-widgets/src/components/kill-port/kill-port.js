/**
 * @file kill端口组件
 * @author zttonly
 */
import {Icon, Button, InputNumber} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/input-number/style';
import './kill-port.less';

export default {
    template: /* html */`
        <div class="kill-port">
            <div class="status status-{{status}}">
                <s-icon type="{{icons[status]}}"/>
                <div class="info">{{state.status}}</div>
            </div>
            <div class="actions">
                <s-input-number
                    min="0" 
                    max="9999"
                    value="{=port=}"
                    size="large"
                    on-change="onchange"
                ></s-input-number>
                <s-button class="huge" type="primary" value="large" on-click="kill">
                    <s-icon type="thunderbolt" theme="filled"/>{{state.kill}}
                </s-button>
            </div>
        </div>
    `,
    components: {
        's-icon': Icon,
        's-button': Button,
        's-input-number': InputNumber
    },
    computed: {
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
    },
    initData() {
        return {
            status: 'idle',
            icons: {
                idle: 'thunderbolt',
                killed: 'check-circle',
                error: 'exclamation-circle'
            },
            port: ''
        };
    },
    attached() {
        this.statusTimer = null;
    },
    onchange(p) {
        this.data.set('port', p);
    },
    kill() {
        this.statusTimer && clearTimeout(this.statusTimer);
        this.$callPluginAction('san.widgets.actions.kill-port', {
            port: this.data.get('port')
        });
    }
};
