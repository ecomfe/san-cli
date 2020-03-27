/**
 * @file script.js
 * @author tanglei02(tanglei02@baidu.com)
 */

import {Component} from 'san';

const name = 'Comp Src';

export default class CompSrc extends Component {
    initData() {
        return {
            name: '',
            clicked: {
                time: 0
            }
        }
    }

    click() {
        this.data.set('clicked.time', this.data.get('clicked.time') + 1);
    }

    attached() {
        console.log(`--- ${name} attached ---`);
    }

    detached() {
        console.log(`--- ${name} detached --`);
    }
}

console.log(`---- ${name} File loaded ----`);

