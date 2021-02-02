/**
 * @file 顶部广告组件
 */

import Component from '@lib/san-component';
import './header-ad.less';

/**
 * 组件props
 *
 * @param {Object} adItem 广告信息
 * @param {string} adItem.btn 广告按钮文案
 * @param {string=} adItem.title 弹窗标题（可选）
 * @param {string} adItem.content 弹窗内容文案
 * @param {string=} adItem.image 弹窗图片（可选）
 * @param {string} adItem.modalBtn1 弹窗主按钮文案
 * @param {string=} adItem.modalBtnLink1 弹窗主按钮跳转链接
 * @param {string} adItem.modalBtn2 弹窗副按钮文案
 * @param {string=} adItem.modalBtnLink2 弹窗副按钮跳转链接
 */
export default class App extends Component {
    static template = /* html */`
        <s-dropdown
            trigger="click"
            overlayClassName="header-ad-overlay"
            placement="bottomRight"
            class="header-ad-trigger"
        >
            <div class="header-ad-modal" slot="overlay">
                <div class="header-ad-title">{{adItem.title}}</div>
                <div class="header-ad-content">
                    <p>{{adItem.content}}</p>
                    <p s-if="adItem.image"><img src="{{adItem.image}}" /></p>
                </div>
                <div class="header-ad-footer">
                    <s-button
                        s-if="adItem.modalBtn2 && adItem.modalBtnLink2"
                        class="com-santd-btn-medium" 
                        href="{{adItem.modalBtnLink2}}"
                        target="_blank"
                    >{{adItem.modalBtn2}}
                    </s-button>

                    <s-button 
                        s-if="adItem.modalBtn1 && adItem.modalBtnLink1"
                        type="primary"
                        class="com-santd-btn-medium"
                        href="{{adItem.modalBtnLink1}}"
                        target="_blank"
                    >{{adItem.modalBtn1}}</s-button>
                </div>
            </div>
            <s-button type="primary" class="com-santd-btn-medium">{{adItem.btn}}</s-button>
        </s-dropdown>
    `;
}
