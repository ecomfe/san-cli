/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file simple-child.san.js
 * @author clark-t
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

