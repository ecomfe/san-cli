/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file index.js
 * @author clark-t
 */

import san from 'san';
import {connect} from 'san-store';
import '../../../store/global-action';
import template from './template.html';
import './style.less';

const name = 'Comp Global Store JS';

/* eslint-disable */

// 这块就是要测试 Function 形式的写法，所以得把 eslint 检查干掉

function CompGlobalStoreJs(options) {
    san.Component.call(this, options);
}

san.inherits(CompGlobalStoreJs, san.Component);
CompGlobalStoreJs.prototype.template = template;

CompGlobalStoreJs.prototype.initData = function () {
    return {
        name: name
    };
};

CompGlobalStoreJs.prototype.click = function () {
    this.actions.inc(this.data.get('time') || 0);
};

CompGlobalStoreJs.prototype.attached = function () {
    console.log(`--- ${name} attached ---`);
};

CompGlobalStoreJs.prototype.detached = function () {
    console.log(`--- ${name} detached --`);
};

export default connect.san(
    {time: 'num'},
    {inc: 'inc'}
)(CompGlobalStoreJs);

console.log(`---- ${name} File loaded ----`);

/* eslint-enable */
