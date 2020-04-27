/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file custom-store.js
 * @author clark-t
 */

import {Store} from 'san-store';
import {builder} from 'san-update';

const store = new Store({
    initData: {
        num: 0
    },
    actions: {
        inc: function (num) {
            return builder().set('num', num + 1);
        }
    }
});

store.addAction('dec', function (num) {
    return builder().set('num', num - 1);
});

export default store;

