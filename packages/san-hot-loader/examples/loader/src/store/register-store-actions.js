/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file register-store-actions.js
 * @author clark-t
 */

import {builder} from 'san-update';
import {store} from 'san-store';

store.addAction('count', function (num) {
    return builder().set('num', num);
});

console.log('Register Store Actions Loaded');

