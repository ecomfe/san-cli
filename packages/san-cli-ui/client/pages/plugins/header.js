/**
 * @file 插件管理顶部
 */

import Component from '@lib/san-component';
import DependencyFilter from '@components/dependency/dependency-filter';

export default class App extends Component {
    static template = /* html */`
        <div class="plugins-header">
            <c-dependency-filter on-keywordChange="keywordChange" />
             <s-dropdown s-if="showDevTools"
                trigger="click"
                overlayClassName="header-tip-overlay"
                placement="bottomRight"
                class="header-tip-trigger"
            >
                <div class="header-tip" slot="overlay">
                    <div class="header-tip-header">{{$t('dashboard.devtools.title')}}</div>
                    <div class="header-tip-content">
                        <p>{{$t('dashboard.devtools.content')}}</p>
                        <p><img src="{{$t('dashboard.devtools.image')}}" alt="default image"/></p>
                    </div>
                    <div class="header-tip-footer">
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
            <s-button type="primary" class="com-santd-btn-medium" on-click="showModal">
                {{$t('plugins.installPackage')}} <s-icon type="plus"/>
            </s-button>
        </div>
    `;

    static components = {
        'c-dependency-filter': DependencyFilter
    };

    initData() {
        return {
            showDevTools: false
        };
    }
    attached() {
        this.data.set('showDevTools', /Chrome/.test(navigator.userAgent)
            && /Google Inc/.test(navigator.vendor)
            && !Object.prototype.hasOwnProperty.call(window, '__san_devtool__')
        );
    }
    showModal() {
        this.$emit('showModal', true);
    }

    keywordChange(keyword) {
        keyword = keyword.trim();
        this.$emit('keywordChange', keyword);
    }
}
