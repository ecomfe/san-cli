/**
 * @file custom-store-actions.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

import {builder} from 'san-update';

export default {
    inc: function (num) {
        return builder().set('num', num + 5);
    },
    dec: function (num) {
        return builder().set('num', num - 1);
    }
};

console.log('Custom Store Action Loaded');

