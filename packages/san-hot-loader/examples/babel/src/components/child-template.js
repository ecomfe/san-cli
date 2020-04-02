/**
 * @file child-template.js
 * @author tanglei02(tanglei02@baidu.com)
 */

export default `
<div>
    <button on-click="clicked">child {{num}} {{clickee}}</button>
    <slot></slot>
</div>
`;
