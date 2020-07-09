/**
 * @file package包搜索框
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon, Radio} from 'santd';
import './dependency-filter.less';

export default class SearchBox extends Component {
    static template = /* html */`
        <div class="dependency-searchbox">
            <s-input-search
                placeholder="{{$t('dependency.searchPlaceholder')}}"
                value="{=filterKeyword=}"
                size="large">
            </s-input-search>
        </div>
    `;

    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon,
        's-radio': Radio,
        's-group': Radio.Group
    }

    attached() {
        this.watch('filterKeyword', value => {
            this.fire('keywordChange', value);
        });
    }
}
