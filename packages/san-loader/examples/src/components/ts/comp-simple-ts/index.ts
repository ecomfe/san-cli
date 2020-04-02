/**
 * @file index.ts
 * @author tanglei02(tanglei02@baidu.com)
 */

import {Component} from 'san';
import '../../../store/global-action';
import template from './template.html';
import './style.less';

const name = 'Comp Global Store TS';


export default class CompSimpleTs extends Component {
    static template = template;
    static computed = {
        next(this:CompSimpleTs):Number {
            return this.data.get('age') + 1;
        }
    };
    initData() {
        return {
            name: name
        };
    }

    attached() {
        console.log(`--- ${name} attached ---`);
    }

    detached() {
        console.log(`--- ${name} detached --`);
    }

}

console.log(`---- ${name} File loaded ----`);


