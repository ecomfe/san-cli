/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file child.js
 * @author clark-t
 */

let san = require('san');
let sanStore = require('san-store');
let store = require('../store/custom.store');
let template = require('./child-template');

store = store.__esModule ? store.default : store;
template = template.__esModule ? template.default : template;

let connect = sanStore.connect;

class Child extends san.Component {
    static template = template;
    initData() {
        return {
            name: 'Child'
        };
    }
    clicked() {
        var num = this.data.get('num');
        this.actions.inc(num);
        this.fire('customclick', num + 42);
    }
}

let connector = connect.createConnector(store);

module.exports = connector({num: 'num'}, {inc: 'inc'})(Child);

console.log('Child Loaded');
