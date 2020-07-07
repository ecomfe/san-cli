/**
 * @file 字符化
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli/lib/util/stringifyJS.js
 *  TODO:优化
 */

module.exports = function stringifyJS(value) {
    const stringify = require('javascript-stringify');
    // eslint-disable-next-line no-shadow
    return stringify(value, (val, indent, stringify) => {
        if (val && val.__expression) {
            return val.__expression;
        }
        return stringify(val);
    }, 2);
};
