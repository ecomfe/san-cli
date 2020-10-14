/**
 * @file 项目管理容器顶部
*/

import {Link} from 'san-router';
import Component from '@lib/san-component';

export default class Project extends Component {
    static template = /* html */`
        <s-dropdown trigger="click" class="dropdown" placement="bottomCenter">
            <s-menu
                slot="overlay"
                style="box-shadow: 0 2px 10px 3px #c8dBff;
                    border-radius: 9px;
                    width: 160px;
                    background-color: #236eff;"
                selectable="{{false}}">
                <fragment s-for="item, index in $t('project.select.menu')">
                    <s-menu-divider s-if="index !== 0" style="opacity: 0.3;"></s-menu-divider>
                    <s-menu-item key="{{item.key}}">
                        <r-link to="{{item.link}}"
                            style="color: #fff; text-align: center; font-size: 20px;">
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
