/**
 * @file 已安装依赖列表
 * @author sunxiaoyu333
 */

import {Component} from 'san';
import {Button, Icon} from 'santd';
import './index.less';

export default class ProjectBody extends Component {
    static template = /* html */`
        <div class="body">
            <span>{{$t('dependency.title')}}</span>
            <div class="list">
                <div class="item">
                    <div class="image-wrap"><img class="image" src="https://avatars.dicebear.com/v2/identicon/@baidu-nano.svg"/></div>
                    <div class="name-wrap">
                        <div class="name">@baidu/nano</div>
                        <div class="version">{{$t('dependency.version')}}0.1.26</div>
                    </div>
                    <div class="version name-wrap">{{$t('dependency.lowVersion')}}0.1.26</div>
                    <div class="version name-wrap">{{$t('dependency.currentVersion')}}0.1.26</div>
                    <s-icon type="check-circle" class="name-wrap"/>
                    <div class="status">{{$t('dependency.installed')}}</div>
                    <div class="check">{{$t('dependency.checkDetail')}}</div>
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
