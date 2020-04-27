/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file app.js
 * @author clark-t
 */

import san from 'san';
import utils from '../utils';
import {store, connect} from 'san-store';
import '../store/register-store-actions';
import Child from './child';
import SimpleChild from './simple-child.san';

// 测试 identifier 各种赋值是否能够检测成功
let sanRefer = san;
let {defineComponent: defineComp} = sanRefer;
let def = defineComp;

let component = def({
    template: `
        <div>
            <button on-click="count">hello {{name}}, click {{num || 0}} times</button>
            <child></child>
            <simple-child></simple-child>
        </div>
    `,
    initData: function () {
        return {
            name: 'App'
        };
    },
    attached: function () {
        utils.hello();
    },
    count: function () {
        store.dispatch('count', (this.data.get('num') || 0) + 1);
    },
    components: {
        'child': Child,
        'simple-child': SimpleChild
    }
});

export default connect.san({
    num: 'num'
})(component);


console.log('App Loaded');

