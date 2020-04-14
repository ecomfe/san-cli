/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file custom-action.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

import {builder} from 'san-update';
import store from './custom-store';

store.addAction('mul', function (num) {
    return builder().set('num', num * 2);
});

