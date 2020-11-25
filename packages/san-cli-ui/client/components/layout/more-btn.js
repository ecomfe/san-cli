/**
 * @file 布局组件的头部更多按钮
 * @author Lohoyo
 */

import Component from '@lib/san-component';
import './more-btn.less';
import UI_THEME from '@graphql/theme/theme.gql';
import UI_THEME_CHANGE from '@graphql/theme/themeChange.gql';

export default class MoreBtn extends Component {
    static template = /* html */`
        <s-dropdown trigger="click" overlayClassName="layout-more-btn-dropdown">
            <div slot="overlay">
                <span>{{$t('moreBtn.darkmode')}}</span>
                <s-switch on-change='changeTheme' defaultChecked="{{isDarkmode}}"/>
            </div>
            <div class="layout-more-btn"></div>
        </s-dropdown>
    `;

    async inited() {
        const res = await this.$apollo.query({query: UI_THEME});
        if (res && res.data && res.data.theme === 'darkmode') {
            this.data.set('isDarkmode', true);
        }
    }

    async changeTheme() {
        const targetTheme = document.body.className.indexOf('darkmode') === -1 ? 'darkmode' : '';
        const res = await this.$apollo.mutate({
            mutation: UI_THEME_CHANGE,
            variables: {
                theme: targetTheme
            }
        });
        if (res && res.data && res.data.themeChange) {
            if (targetTheme) {
                document.body.classList.add(targetTheme);
            } else {
                document.body.classList.remove('darkmode');
            }
        }
    }
}
