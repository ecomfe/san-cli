/**
 * @file mock store code
 * @author tanglei02 (tanglei@baidu.com)
 */

export const globalActions = [
    `
    import {store} from 'san-store';
    import {builder} from 'san-update';

    store.addAction('count', function (num) {
        return builder().set('num', num);
    });

    store.addAction('decrease', function (num) {
        return builder().set('num', num - 1);
    });
    `,
    `
    const sanStore = require('san-store');
    import {builder} from 'san-update';
    const store = sanStore.store;
    store.addAction('decrease', function (num) {
        return builder().set('num', num - 1);
    });
    `
];

export const noGlobalActions = [
    `
    import san from 'san';
    export default san.defineComponent({
        template: 'Hello World'
    })
    `,
    `
    import {store} from 'san-store';
    import {builder} from 'san-update';
    `,

    `
    import {store} from 'san-store';
    import {builder} from 'san-update';

    store.addAction('count', function (num) {
        return builder().set('num', num);
    });

    store.addAction('decrease', function (num) {
        return builder().set('num', num - 1);
    });

    export default store;
    `,
    `
    import {store} from 'san-store';
    import {builder} from 'san-update';

    store.addAction('count', function (num) {
        return builder().set('num', num);
    });

    store.addAction('decrease', function (num) {
        return builder().set('num', num - 1);
    });

    exports.store = store, exports.somthing = 1024;
    `,

    `
    import {store} from 'san-store';
    import {builder} from 'san-update';

    store.addAction('count', function (num) {
        return builder().set('num', num);
    });

    store.addAction('decrease', function (num) {
        return builder().set('num', num - 1);
    });

    export const aStore = store;
    `,
    `
    const {store} = require('san-store');
    const {builder} = require('san-update');

    store.addAction('count', function (num) {
        return builder().set('num', num);
    });

    store.addAction('decrease', function (num) {
        return builder().set('num', num - 1);
    });

    exports.store = store;
    `,

    `
    const sanStore = require('san-store');
    import {builder} from 'san-update';
    const store = sanStore111.store;
    store.addAction('decrease', function (num) {
        return builder().set('num', num - 1);
    });

    `
];

export const instantStores = [
    `
    import {Store} from 'san-store';
    import actions from './actions';
    export default new Store({
        actions
    })
    `,

    `
    const {Store} = require('san-store');
    const actions = require('./actions');
    const newStore = new Store({
        actions: actions
    });
    module.exports = newStore;
    `
];

export const noInstantStores = [

    `
    import {Store} from 'san-store';
    export default new Store();
    `,

    `
    import {Store} from 'san-store';
    import actions from './actions';
    export default new Store111({
        actions
    })
    `,
    `
    import {Store} from 'san-store';
    import actions from './actions';
    export default Store({actions});
    `
];

