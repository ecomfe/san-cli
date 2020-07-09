/**
 * @file 安装依赖头部组件（搜索框+安装依赖按钮）
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon, Radio} from 'santd';
import './dependency-head.less';

export default class DependenceHead extends Component {
    static template = /* html */`
        <div class="dependency-head">
            <s-group name="radiogroup" value="{{radioValue}}" on-change="radioChange">
                <s-radio value="dependencies">{{$t('dependency.dependencies')}}</s-radio>
                <s-radio value="devDependencies">{{$t('dependency.devDependencies')}}</s-radio>
            </s-group>
            <s-input-search class="pkg-input"/>
            <s-button class="pkg-modal-button" on-click="modalShow" type="primary">
                <s-icon type="plus"/>
                <span>{{$t('dependency.installDependency')}}</span>
            </s-button>
        </div>
    `;

    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon,
        's-radio': Radio,
        's-group': Radio.Group
    }
    modalShow() {
        this.fire('modalShow');
    }
    radioChange(event) {
        this.fire('radioChange', event);
    }
}
