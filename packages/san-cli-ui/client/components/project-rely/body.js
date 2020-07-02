/**
 * @file Body组件
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Button, Icon} from 'santd';
import './index.less';

export default class ProjectBody extends Component {
    static template = /* html */`
        <div class="body">
            <span>项目依赖</span>
            <div class="list">
                <div class="item">
                    <div class="image-wrap"><img class="image" src="https://avatars.dicebear.com/v2/identicon/@baidu-nano.svg"/></div>
                    <div class="name-wrap">
                        <div class="name">@baidu/nano</div>
                        <div class="version">版本0.1.26</div>
                    </div>
                    <div class="version name-wrap">要求最低版本0.1.26</div>
                    <div class="version name-wrap">当前最新版本0.1.26</div>
                    <s-icon type="check-circle" class="name-wrap"/>
                    <div class="status">已安装</div>
                    <div class="check">查看详情</div>
                </div>
                <s-icon type="delete" class="delete"/>
            </div>
        </div>
    `;

    static components = {
        's-button': Button,
        's-icon': Icon
    }
}
