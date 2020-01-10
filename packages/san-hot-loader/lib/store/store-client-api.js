/**
 * @file store-client-api.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

var cache = {};

module.exports = {
    wrapAddAction: function (id, store) {
        if (cache[id]) {
            return;
        }
        cache[id] = {};
        var originalAddAction = store.addAction.bind(store);
        store.addAction = function (name, callback) {
            if (store.actions[name] && !cache[id][name]) {
                store.actions[name] = null;
                cache[id][name] = true;
            }
            originalAddAction(name, callback);
        };
    },
    updateActions: function (store, actions) {
        var keys = Object.keys(actions);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            store.addAction(key, actions[key]);
        }
    },
    cleanCache: function (id) {
        cache[id] = {};
    }
};

