import {Store} from 'san-store';
import actions from './instant-store-actions';

export default new Store({
    initData: {
        num: 0
    },
    actions: actions
});

