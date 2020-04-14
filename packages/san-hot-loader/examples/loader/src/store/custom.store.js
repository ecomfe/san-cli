/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file custom.store.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

import {Store} from 'san-store';
import actions from './custom-store-actions';

export default new Store({
    initData: {
        num: 0
    },
    actions: actions
});

console.log('Custom Store Loaded');

