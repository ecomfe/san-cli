/**
 * @file 插件管理顶部
 */

import Component from '@lib/san-component';
import './dev-tools-tip.less';

export default class App extends Component {
    static template = /* html */`
        <s-dropdown s-if="showDevTools"
        trigger="click"
        overlayClassName="devtool-tip-overlay"
        placement="bottomRight"
        class="devtool-tip-trigger"
    >
        <div class="devtool-tip" slot="overlay">
            <div class="devtool-tip-header">{{$t('dashboard.devtools.title')}}</div>
            <div class="devtool-tip-content">
                <p>{{$t('dashboard.devtools.content')}}</p>
                <p><img src="{{$t('dashboard.devtools.image')}}" /></p>
            </div>
            <div class="devtool-tip-footer">
                <s-button
                    class="com-santd-btn-medium" 
                    href="{{$t('dashboard.devtools.link')}}"
                    target="_blank"
                >{{$t('dashboard.devtools.more')}}
                </s-button>

                <s-button 
                    type="primary"
                    class="com-santd-btn-medium"
                    href="{{$t('dashboard.devtools.chromeLink')}}"
                    target="_blank"
                >{{$t('dashboard.devtools.confirm')}}</s-button>
            </div>
        </div>
        <s-button type="primary" class="com-santd-btn-medium">{{$t('dashboard.tools')}}</s-button>
    </s-dropdown>
    `;

    initData() {
        return {
            showDevTools: false
        };
    }

    attached() {
        const showDevTools = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
            && !Object.prototype.hasOwnProperty.call(window, '__san_devtool__');
        this.data.set('showDevTools', showDevTools);
    }
}
