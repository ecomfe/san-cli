/**
 * @file runtime utils
 * @author tanglei02 (tanglei02@baidu.com)
 */

function esm(obj) {
    return obj.__esModule ? obj.default : obj;
}

function getExports(mod) {
    return esm(mod.exports || mod.constructor.prototype.exports);
}

module.exports = {
    esm: esm,
    getExports: getExports
};

