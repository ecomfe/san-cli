/**
 * @file custom.store.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

import {Store} from 'san-store';
import actions from './custom-store-actions';

export default new Store({
    initData: {
        num: 2
    },
    actions: actions
});


console.log('Custom Store Loaded');

