/**
 * @file get-handler.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const ComponentHandler = require('./component/component-hmr-handler');
const StoreHandler = require('./store/store-hmr-handler');

const constructors = [
    ComponentHandler,
    StoreHandler
];

module.exports = function (matchOptions) {
    for (const Constructor of constructors) {
        const handler = new Constructor(matchOptions);
        if (!handler.enable) {
            continue;
        }

        const matchResult = handler.match();
        if (!matchResult) {
            continue;
        }

        return handler;
    }
};

