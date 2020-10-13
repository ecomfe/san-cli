/**
 * @file 仪表盘顶部
 */

import Component from '@lib/san-component';

import './header.less';

export default class App extends Component {
    static template = /* html */`
        <div class="dashboard-header">
            <s-button disabled="{{true}}">{{$t('dashboard.tools')}}</s-button>
            <div on-click="toggleStatus" class="icon {{editing ? 'check-icon' : 'custom-icon'}}"></div>
        </div>
    `;
    toggleStatus() {
        this.$emit('toggleStatus');
    }
}
