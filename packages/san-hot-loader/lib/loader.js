/**
 * @file loader.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

// const path = require('path');
const getHandler = require('./get-handler');
const loaderUtils = require('loader-utils');
const parse = require('./utils/ast-parser');

module.exports = async function (source, inputSourceMap) {
    this.cachable = true;
    const callback = this.async();
    const options = loaderUtils.getOptions(this) || {};

    if (options.enable === false) {
        callback(null, source, inputSourceMap);
        return;
    }

    const resourcePath = this.resourcePath;
    const needMap = this.sourceMap;

    let ast;
    try {
        ast = parse(source, {resourcePath});
    }
    catch (e) {
        callback(null, source, inputSourceMap);
        return;
    }

    const matchOptions = {
        ast,
        source,
        options,
        resourcePath,
        needMap,
        inputSourceMap,
        warning: this.emitWarning.bind(this)
    };

    let handler = getHandler(matchOptions);
    if (handler) {
        const {code, map} = await handler.genCode();
        callback(null, code, map);
    }
    else {
        callback(null, source, inputSourceMap);
    }

};
