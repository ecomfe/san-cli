/**
 * @file 欢迎组件
 * @author zttonly
 */

import styles from './welcome.less';
import sanLogo from '../../assets/san-white.svg';

export default {
    template: /* html */`
        <div class="{{styles.widgetWelcome}}">
            <div class="{{styles.logoWrapper}}">
                <img src="{{sanLogo}}" class="{{styles.logo}}"/>
            </div>
            <div class="{{styles.title}}">
                {{$t('dashboard.widgets.welcome.content.title')}}
            </div>
            <div class="{{styles.tips}}">
                <div s-for="n in num" class="{{styles.tip}}">
                    <s-icon type="{{tipIcons[n - 1]}}"/>
                    <div class="{{styles.message}}">
                        {{$t('dashboard.widgets.welcome.content.tips' + n) | raw}}
                    </div>
                </div>
            </div>
            <div class="{{styles.actions}} flex-none">
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
            styles,
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
