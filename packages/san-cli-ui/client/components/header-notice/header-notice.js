/**
 * @file 顶部广告组件
 */

import Component from '@lib/san-component';
import './header-notice.less';

/**
 * 组件props
 *
 * @param {Object} noticeItem 广告信息
 * @param {string} noticeItem.btn 广告按钮文案
 * @param {string=} noticeItem.title 弹窗标题（可选）
 * @param {string} noticeItem.content 弹窗内容文案
 * @param {string=} noticeItem.image 弹窗图片（可选）
 * @param {string} noticeItem.modalBtn1 弹窗主按钮文案
 * @param {string=} noticeItem.modalBtnLink1 弹窗主按钮跳转链接
 * @param {string} noticeItem.modalBtn2 弹窗副按钮文案
 * @param {string=} noticeItem.modalBtnLink2 弹窗副按钮跳转链接
 */
export default class App extends Component {
    static template = /* html */`
        <s-dropdown
            trigger="click"
            overlayClassName="header-notice-overlay"
            placement="bottomRight"
            class="header-notice-trigger"
        >
            <div class="header-notice-modal" slot="overlay">
                <div class="header-notice-title">{{noticeItem.title}}</div>
                <div class="header-notice-content">
                    <p>{{noticeItem.content}}</p>
                    <p s-if="noticeItem.image"><img src="{{noticeItem.image}}" /></p>
                </div>
                <div class="header-notice-footer">
                    <s-button
                        s-if="noticeItem.modalBtn2 && noticeItem.modalBtnLink2"
                        class="com-santd-btn-medium" 
                        href="{{noticeItem.modalBtnLink2}}"
                        target="_blank"
                    >{{noticeItem.modalBtn2}}
                    </s-button>

                    <s-button 
                        s-if="noticeItem.modalBtn1 && noticeItem.modalBtnLink1"
                        type="primary"
                        class="com-santd-btn-medium"
                        href="{{noticeItem.modalBtnLink1}}"
                        target="_blank"
                    >{{noticeItem.modalBtn1}}</s-button>
                </div>
            </div>
            <s-button type="primary" class="com-santd-btn-medium">{{noticeItem.btn}}</s-button>
        </s-dropdown>
    `;
}
