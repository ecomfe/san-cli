/**
 * @file 已安装的package检索框
 * @author sunxiaoyu333, Lohoyo
 */

import Component from '@lib/san-component';
import './dependency-filter.less';

export default class SearchBox extends Component {
    static template = /* html */`
        <s-input-search
            placeholder="{{$t('dependency.searchPlaceholder')}}"
            value="{=filterKeyword=}"
            size="large"
            class="dependency-filter">
        </s-input-search>
    `;

    attached() {
        this.watch('filterKeyword', value => {
            this.fire('keywordChange', value);
        });
    }
}
