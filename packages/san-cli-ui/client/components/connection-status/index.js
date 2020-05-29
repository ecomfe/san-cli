/**
 * @file connectionStatus组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {Icon} from 'santd';
import CONNECTED from '@/graphql/connected/connected.gql';
import 'santd/es/icon/style';
import './index.less';

export default class ConnectionStatus extends Component {

    static template = /* html */`
        <div s-if="connected" class="connection-status">
            <div class="content disconnected">
                <s-icon type="disconnect"/>
                <span>{{$t('connection-status.disconnected')}}</span>
            </div>
            <div class="content connected">
                <s-icon type="wifi"/>
                <span>{{$t('connection-status.connected')}}</span>
            </div>
        </div>
    `;
    static components = {
        's-icon': Icon
    };

    initData() {
        return {
            connected: true
        };
    }

    async attached() {
        let connected = await this.$apollo.query({query: CONNECTED});
        // console.log(connected);
        if (connected.data) {
            this.data.set('connected', connected.data.connected);
        }
    }
}
