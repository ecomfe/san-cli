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
        this.actions.inc(this.data.get('num'));
    }
}

let connector = connect.createConnector(store);

export default connector({num: 'num'}, {inc: 'inc'})(Child);

// console.log(Object.getPrototypeOf(module.exports) === san.Component)
// console.log(Object.getPrototypeOf(Child) === san.Component)
// console.log(store instanceof sanStore.Store)

// console.log('Child Loaded');
