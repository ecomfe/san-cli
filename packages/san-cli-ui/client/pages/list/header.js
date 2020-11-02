/**
 * @file 用户项目列表顶部
*/

import Component from '@lib/san-component';
import Menu from '@components/layout/menu';
import './header.less';

export default class Project extends Component {
    static template = /* html */`
    <div class="list-head-right">
        <s-input-search
            class="project-filter"
            placeholder="{{$t('project.list.searchPlaceholder')}}"
            size="large"
            on-change="filterInputChange">
        </s-input-search>
        <c-menu />
    </div>
    `;
    static components = {
        'c-menu': Menu
    };

    filterInputChange(filterInput) {
        this.$emit('filterInputChange', filterInput);
    }
}
