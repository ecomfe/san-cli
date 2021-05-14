/**
 * @file 插件管理顶部
 */

import Component from '@lib/san-component';
import DependencyFilter from '@components/dependency/dependency-filter';
import HeaderNotice from '@components/header-notice';
import './header.less';

export default class App extends Component {
    static template = /* html */`
        <div class="plugins-header">
            <c-dependency-filter on-keywordChange="keywordChange" />
            <c-header-notice s-if="showDevTools" noticeItem="{{$t('plugins.devtools')}}"></c-header-notice>
            <s-button type="primary" class="com-santd-btn-medium install-btn" on-click="showModal">
                {{$t('plugins.installPackage')}} <s-icon type="plus"/>
            </s-button>
        </div>
    `;

    static components = {
        'c-dependency-filter': DependencyFilter,
        'c-header-notice': HeaderNotice
    };

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

    showModal() {
        this.$emit('showModal', true);
    }

    keywordChange(keyword) {
        keyword = keyword.trim();
        this.$emit('keywordChange', keyword);
    }
}
