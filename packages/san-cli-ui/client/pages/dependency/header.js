/**
 * @file 依赖管理顶部
 */

import Component from '@lib/san-component';
import DependencyFilter from '@components/dependency/dependency-filter';
import './header.less';

export default class App extends Component {
    static template = /* html */`
        <div class="dependency-header">
            <c-dependency-filter on-keywordChange="keywordChange" />
            <s-button type="primary" class="com-santd-btn-medium install-btn" on-click="showModal">
                {{$t('dependency.installPackage')}} <s-icon type="plus"/>
            </s-button>
        </div>
    `;

    static components = {
        'c-dependency-filter': DependencyFilter
    };

    showModal() {
        this.$emit('showModal', true);
    }

    keywordChange(keyword) {
        keyword = keyword.trim();
        this.$emit('keywordChange', keyword);
    }
}
