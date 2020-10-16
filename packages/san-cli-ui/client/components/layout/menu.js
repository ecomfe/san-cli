/**
 * @file 项目管理容器顶部
*/

import {Link} from 'san-router';
import Component from '@lib/san-component';
import './menu.less';

export default class Project extends Component {
    static template = /* html */`
        <s-dropdown trigger="click" class="dropdown" placement="bottomCenter" overlayClassName="menu-dropdown">
            <s-menu slot="overlay" selectable="{{false}}">
                <fragment s-for="item, index in $t('project.select.menu')">
                    <s-menu-divider s-if="index !== 0"></s-menu-divider>
                    <s-menu-item key="{{item.key}}">
                        <r-link to="{{item.link}}">
                            <s-icon type="{{item.icon}}" style="font-size: 20px;"></s-icon>
                            <span>{{item.text}}</span>
                        </r-link>
                    </s-menu-item>
                </fragment>
            </s-menu>
            <s-button size="large" type="primary" shape="circle" icon="plus" />
        </s-dropdown>
    `;
    static components = {
        'r-link': Link
    };

    filterInputChange(filterInput) {
        this.$emit('filterInputChange', filterInput);
    }
}
