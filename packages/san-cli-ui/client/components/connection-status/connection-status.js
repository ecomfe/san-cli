/**
 * @file connectionStatus组件
 * @author zttonly
 */

import Component from '@lib/san-component';
import {onReconnected, onDisconnected} from '@lib/connection';
import './connection-status.less';


export default class ConnectionStatus extends Component {
    static template = /* html */`
        <div class="connection-status {{showStatus ? '' : 'connection-animation'}}">
            <div class="content {{connected ? 'connected' : 'disconnected'}}">
                <s-icon type="{{connected ? 'wifi' : 'disconnect'}}"/>
                <span>{{$t(connected ? 'connection-status.connected' : 'connection-status.disconnected')}}</span>
            </div>
        </div>
    `;

    initData() {
        return {
            // 控制样式
            connected: true,
            // 控制动画及状态可见性
            showStatus: false
        };
    }

    async attached() {
        onDisconnected(() => {
            this.data.set('showStatus', true);
            this.data.set('connected', false);
        });

        onReconnected(() => {
            this.data.set('showStatus', true);
            this.data.set('connected', true);
            setTimeout(() => {
                this.data.set('showStatus', false);
            }, 1500);
        });
    }
}
