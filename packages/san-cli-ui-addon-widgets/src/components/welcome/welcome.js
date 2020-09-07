/**
 * @file 欢迎组件
 * @author zttonly
 */

import './welcome.less';

export default {
    template: /* html */`
        <div class="welcome">
            <div class="logo-wrapper">
                <img src="https://baidu.github.io/san/img/logo-colorful.svg" class="logo"/>
            </div>
            <div class="title">
                {{$t('dashboard.widgets.welcome.content.title')}}
            </div>
            <div class="tips">
                <div s-for="n in num" class="tip">
                    <s-icon type="{{tipIcons[n - 1]}}" style="font-size: 26px; color: #1890ff"/>
                    <div class="message">
                        {{$t('dashboard.widgets.welcome.content.tips' + n)}}
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
            ]
        };
    },
    remove() {
        const id = this.data.get('data.widget.id');
        this.dispatch('Widget:remove', id);
    }
};
