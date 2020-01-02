import {builder} from 'san-update';
import {store} from 'san-store';

store.addAction('count', function (num) {
    return builder().set('num', num);
});

