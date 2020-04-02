/**
 * @file simple-child.san.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

import {Component} from 'san';

export default class SimpleChild extends Component {
    static template = '<div>This is {{name}}</div>';
    initData() {
        return {
            name: 'Simple Child'
        };
    }
}

console.log('SimpleChild Loaded');

