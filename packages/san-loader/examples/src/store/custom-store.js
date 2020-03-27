/**
 * @file custom-store.js
 * @author tanglei02 (tanglei02@baidu.com)
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

