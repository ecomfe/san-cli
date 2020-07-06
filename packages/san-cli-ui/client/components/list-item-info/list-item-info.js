/**
 * @file List-item-info组件
 * @author zttonly
 */

import {Component} from 'san';
import {Icon} from 'santd';
import 'santd/es/icon/style';
import './list-item-info.less';

export default class ListItemInfo extends Component {

    static template = /* html */`
        <div class="list-item-info">
            <div class="name">
                <span>{{name}}</span>
            </div>
            <div class="description">
                <span>{{description}}</span>
                <a s-if="link"
                    class="more-info"
                    href="{{link}}"
                    target="_blank"
                    on-click="handleLink($event)"
                >
                    <s-icon type="info-circle"></s-icon>
                    {{$t('config.list-item-info.more')}}
                </a>
            </div>
        </div>
    `;
    initData() {
        return {
            name: '',
            description: '',
            link: '',
            selected: false
        };
    }

    static components = {
        's-icon': Icon
    }
    handleLink(e) {
        e.stopPropagation();
    }
}
