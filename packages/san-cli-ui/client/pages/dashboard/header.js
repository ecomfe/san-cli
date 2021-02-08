/**
 * @file 仪表盘顶部
 */

import Component from '@lib/san-component';
import './header.less';

export default class App extends Component {
    static template = /* html */`
        <div class="dashboard-header">
            <div on-click="toggleStatus" class="icon {{editing ? 'check-icon' : 'custom-icon'}}"></div>
        </div>
    `;

    initData() {
        return {
            editing: false
        };
    }

    toggleStatus() {
        const editingNew = !this.data.get('editing');
        this.data.set('editing', editingNew);
        this.$emit('toggleContentStatus', editingNew);
    }
}
