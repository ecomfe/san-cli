/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file child-template.js
 * @author tanglei02(tanglei02@baidu.com)
 */

export default `
<div>
    <button on-click="clicked">child {{num}} {{clickee}}</button>
    <slot></slot>
</div>
`;
