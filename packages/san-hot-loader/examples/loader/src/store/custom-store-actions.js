/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file custom-store-actions.js
 * @author clark-t
 */

import {builder} from 'san-update';

export default {
    inc: function (num) {
        return builder().set('num', num + 10);
    },
    dec: function (num) {
        return builder().set('num', num - 1);
    }
};

console.log('Custom Store Action Loaded');

