/**
 * @file 安装依赖头部组件（搜索框+安装依赖按钮）
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Input, Button, Icon} from 'santd';
import './index.less';

export default class DependenceHead extends Component {
    static template = /* html */`
        <div class="dependency-head">
            <s-input-search class="dependency-head-input"/>
            <s-button class="dependency-head-button" on-click="modeShow" type="primary">
                <s-icon type="plus" class="dependency-head-plus"/>
                <span class="dependency-head-text">{{$t('dependency.installDependency')}}</span>
            </s-button>
        </div>
    `;

    initData() {
        return {
        };
    }

    static components = {
        's-button': Button,
        's-input-search': Input.Search,
        's-icon': Icon
    }

    modeShow() {
        this.fire('modeShow');
    }
}
