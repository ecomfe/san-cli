/**
 * @file child.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

let san = require('san');
let sanStore = require('san-store');
let store = require('../store/custom.store');

store = store.__esModule ? store.default : store;

let connect = sanStore.connect;

class Child extends san.Component {
    static template = `
        <div>
            <p>this is {{name}} and click {{num}} times</p>
            <button on-click="clicked">click child</button>
        </div>`;
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
