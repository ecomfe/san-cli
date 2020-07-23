/**
 * @file 欢迎组件
 * @author zttonly
 */
import {Icon, Button} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import './welcome.less';

export default {
    template: /* html */`
        <div class="welcome">
            <div class="logo-wrapper">
                <img src="https://baidu.github.io/san/img/logo-colorful.svg" class="logo"/>
            </div>
            <div class="title">
                {{text.welcome.content.title}}
            </div>
            <div class="tips">
                <div s-for="n in num" class="tip">
                    <s-icon type="{{tipIcons[n - 1]}}" style="font-size: 26px; color: #1890ff"/>
                    <div class="message">
                        {{text.welcome.content.tips[n - 1]}}
                    </div>
                </div>
            </div>
            <div class="actions flex-none">
                <s-button
                    icon="check"
                    type="primary"
                    size="large"
                    on-click="remove"
                >{{text.welcome.content.ok}}</s-button>
            </div>
        </div>
    `,
    components: {
        's-icon': Icon,
        's-button': Button
    },
    initData() {
        return {
            num: [1, 2, 3],
            tipIcons: [
                'dashboard',
                'arrow-left',
                'home'
            ],
            widget: {},
            text: {}
        };
    },
    remove() {
        const id = this.data.get('widget.id');
        this.dispatch('Widget:remove', id);
    }
};
