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
                <s-radio value="{{$t('dependency.dependencies')}}">运行依赖</s-radio>
                <s-radio value="{{$t('dependency.devDependencies')}}">开发依赖</s-radio>
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
    initData() {
        return {
            radioValue: ''
        };
    }
    modalShow() {
        this.fire('modalShow');
    }
    radioChange(e) {
        this.data.set('radioValue', e.target.value);
    }
}
