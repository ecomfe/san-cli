var san = require('san');
var sanStore = require('san-store');
var store = require('./instant-store');

store = store.__esModule ? store.default : store;

var connect = sanStore.connect;

class Child extends san.Component {
    initData() {
        return {
            name: 'Child 001'
        }
    }
    clicked() {
        this.actions.inc(this.data.get('num'));
    }
}


function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_defineProperty(Child, 'template', '<div><p>this is {{name}} and click {{num}} times</p><button on-click="clicked">click child</button></div>');

var connector = connect.createConnector(store);

module.exports = connector({num: 'num'}, {inc: 'inc'})(Child);

