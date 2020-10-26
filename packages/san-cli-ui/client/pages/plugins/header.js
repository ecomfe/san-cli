/**
 * @file 插件管理顶部
 */

import Component from '@lib/san-component';
import DependencyFilter from '@components/dependency/dependency-filter';
import DevToolsTip from '@components/widgets/dev-tools-tip';

export default class App extends Component {
    static template = /* html */`
        <div class="plugins-header">
            <c-dependency-filter on-keywordChange="keywordChange" />
            <c-dev-tools-tip />
            <s-button type="primary" class="com-santd-btn-medium" on-click="showModal">
                {{$t('plugins.installPackage')}} <s-icon type="plus"/>
            </s-button>
        </div>
    `;

    static components = {
        'c-dependency-filter': DependencyFilter,
        'c-dev-tools-tip': DevToolsTip
    };

    showModal() {
        this.$emit('showModal', true);
    }

    keywordChange(keyword) {
        keyword = keyword.trim();
        this.$emit('keywordChange', keyword);
    }
}
