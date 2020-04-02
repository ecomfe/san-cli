/**
 * @file register-store-actions.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

import {builder} from 'san-update';
import {store} from 'san-store';

store.addAction('count', function (num) {
    return builder().set('num', num);
});

store.addAction('inc', function (num) {
    return builder().set('num', num + 1);
});

console.log('Register Global Store Actions Loaded');

