/**
 * @file 导入项目顶部
*/

import Component from '@lib/san-component';
import Menu from '@components/layout/menu';
import './header.less';

export default class Project extends Component {
    static template = /* html */`
    <div class="list-head-right">
        <c-menu />
    </div>
    `;
    static components = {
        'c-menu': Menu
    };
}
