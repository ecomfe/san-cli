/**
 * @file loader.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const parser = require('./utils/ast-parser');
const loaderUtils = require('loader-utils');
const ComponentHmrHandler = require('./component/component-hmr-handler');
const StoreHmrHandler = require('./store/store-hmr-handler');

const handlerConstructors = [
    ComponentHmrHandler,
    StoreHmrHandler
];

module.exports = async function (source, inputSourceMap) {
    this.cachable = true;
    const callback = this.async();
    const finish = (code, map) => {
        parser.delete(source);
        callback(null, code, map);
    };

    const options = loaderUtils.getOptions(this) || {};

    try {
        for (const HandlerConstructor of handlerConstructors) {
            const handler = new HandlerConstructor(options, this);

            if (!handler.enable) {
                continue;
            }

            const matchOptions = handler.match(source, handler.options);
            if (!matchOptions) {
                continue;
            }

            const {code, map} = await handler.generate(source, {
                matchOptions,
                inputSourceMap
            });

            finish(code, map);
            return;
        }
    }
    catch (e) {
        this.emitWarning(e);
    }

    finish(source, inputSourceMap);
};

