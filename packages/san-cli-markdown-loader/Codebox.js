/**
 * @file codeBox
 * @author ksky521
 */
export default {
    template: /* html */ `
    <section class="code-box {{isExpand?'expand':''}}">
        <section class="code-box-demo"><code-preview/></section>
        <section class="code-box-meta markdown">
            <text-place-holder/>
            <span class="code-expand-icon" on-click="toggleExpand">
                <img alt="expand code" src="https://gw.alipayobjects.com/zos/rmsportal/wSAkBuJFbdxsosKKpqyq.svg" class="{{isExpand?'code-expand-icon-hide':'code-expand-icon-show'}}">
                <img alt="expand code" src="https://gw.alipayobjects.com/zos/rmsportal/OpROPHYqWmrMDBFMZtKF.svg" class="{{isExpand?'code-expand-icon-show':'code-expand-icon-hide'}}">
            </span>
        </section>
        <section class="highlight-wrapper {{isExpand?'highlight-wrapper-expand':''}}">
            <code-place-holder/>
        </section>
    </section>
    `,
    initData() {
        return {
            isExpand: false
        };
    },
    toggleExpand() {
        this.data.set('isExpand', !this.data.get('isExpand'));
    }
};
