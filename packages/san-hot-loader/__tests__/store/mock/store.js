/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
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
    store.addAction('count', function (num) {
        return builder().set('num', num);
    })}
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
    const something = a['b' + c];
    export default new Store(something);
    `,
    `
    import {Store} from 'san-store';
    const something = a().b.c.d;
    export default new Store(something);
    `,
    `
    import {Store} from 'san-store';
    let something;
    export default new Store(something);
    `,


    `
    import {Store} from 'san-store';
    export default new Store();
    `,
    `
    import {Store} from 'san-store';
    const something = a;
    export default new Store(something);
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
    export default new Store({
        actions: {}
    })
    `,
    `
    import {Store} from 'san-store';
    export default new Store({
        actions: actions
    })
    `,

    `
    import {Store} from 'san-store';
    import actions from './actions';
    export default Store({actions});
    `
];

