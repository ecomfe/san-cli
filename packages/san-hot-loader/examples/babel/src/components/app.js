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

// 测试 identifier 各种赋值是否能够检测成功
let sanRefer = san;
let {defineComponent: defineComp} = sanRefer;
let def = defineComp;

let component = def({
    template: `
        <div>
            <button on-click="count">click {{num || 0}}</button>
            <div s-if="true">
                <child
                    s-for="n in list"
                    s-bind="{{ fn(n + (num || 0)) }}"
                    on-customclick="recieved"
                >
                    <child clickee="{{ num }}">{{ (num || 0) + 6 }}</child>
                <div style="border-top: 1px solid black"></div>
                </child>
            </div>
        </div>
    `,
    initData: function () {
        return {
            name: 'App',
            list: [1, 2, 3]
        };
    },
    attached: function () {
        utils.hello();
    },
    count: function () {
        store.dispatch('count', (this.data.get('num') || 0) + 1);
    },
    recieved: function (source) {
        console.log('--- on recieved --');
        console.log(source);
    },
    fn: function (num) {
        return {
            clickee: num
        };
    },
    components: {
        'child': Child
    }
});

export default connect.san({
    num: 'num'
})(component);


console.log('App Loaded');

