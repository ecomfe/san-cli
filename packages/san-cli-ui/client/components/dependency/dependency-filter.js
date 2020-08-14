/**
 * @file 已安装的package检索框
 * @author sunxiaoyu333
 */

import Component from '@lib/san-component';
import './dependency-filter.less';

export default class SearchBox extends Component {
    static template = /* html */`
        <div class="dependency-filter">
            <s-input-search
                placeholder="{{$t('dependency.searchPlaceholder')}}"
                value="{=filterKeyword=}"
                size="large">
            </s-input-search>
        </div>
    `;

    attached() {
        this.watch('filterKeyword', value => {
            this.fire('keywordChange', value);
        });
    }
}
