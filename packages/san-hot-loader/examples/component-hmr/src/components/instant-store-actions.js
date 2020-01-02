import {builder} from 'san-update';

export default {
    inc: function (num) {
        return builder().set('num', num + 5);
    },
    dec: function (num) {
        return builder().set('num', num - 1)
    }
};

