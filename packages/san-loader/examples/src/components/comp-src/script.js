/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file script.js
 * @author clark-t
 */

import {Component} from 'san';

const name = 'Comp Src';

export default class CompSrc extends Component {
    initData() {
        return {
            name: name,
            clicked: {
                time: 0
            }
        };
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

