/**
 * @file 项目管理容器顶部
*/

import Component from '@lib/san-component';
import './menu.less';

export default class Project extends Component {
    static template = /* html */`
        <s-dropdown trigger="click" class="dropdown" placement="bottomCenter" overlayClassName="menu-dropdown">
            <s-menu slot="overlay" selectable="{{false}}">
                <fragment s-for="item, index in $t('project.select.menu')">
                    <s-menu-divider s-if="index !== 0"></s-menu-divider>
                    <s-menu-item key="{{item.key}}">
                        <s-router-link to="{{item.link}}">
                            <s-icon type="{{item.icon}}" style="font-size: 20px;"></s-icon>
                            <span>{{item.text}}</span>
                        </s-router-link>
                    </s-menu-item>
                </fragment>
            </s-menu>
            <s-button size="large" type="primary" shape="circle" icon="plus" />
        </s-dropdown>
    `;

    filterInputChange(filterInput) {
        this.$emit('filterInputChange', filterInput);
    }
}
