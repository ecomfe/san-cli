/**
 * @file 欢迎组件
 * @author zttonly
 */

import './welcome.less';
import sanLogo from '../../assets/san-white.svg';

export default {
    template: /* html */`
        <div class="dashboard-widget-welcome">
            <div class="logo-wrapper">
                <img src="{{sanLogo}}" class="logo"/>
            </div>
            <div class="title">
                {{$t('dashboard.widgets.welcome.content.title')}}
            </div>
            <div class="tips">
                <div s-for="n in num" class="tip">
                    <s-icon type="{{tipIcons[n - 1]}}"/>
                    <div class="message">
                        {{$t('dashboard.widgets.welcome.content.tips' + n) | raw}}
                    </div>
                </div>
            </div>
            <div class="actions flex-none">
                <s-button
                    icon="check"
                    type="primary"
                    size="large"
                    on-click="remove"
                >
                    {{$t('dashboard.widgets.welcome.content.ok')}}
                </s-button>
            </div>
        </div>
    `,
    initData() {
        return {
            num: [1, 2, 3],
            tipIcons: [
                'dashboard',
                'arrow-left',
                'home'
            ],
            sanLogo
        };
    },
    remove() {
        const id = this.data.get('data.id');
        this.dispatch('Widget:remove', id);
    }
};
