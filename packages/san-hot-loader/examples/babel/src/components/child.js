/**
 * @file child.js
 * @author tanglei02 (tanglei02@baidu.com)
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

module.exports = connector({num: 'num'}, {inc: 'inc'})(Child);

console.log('Child Loaded');
