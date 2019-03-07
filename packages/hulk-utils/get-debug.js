/**
 * @file get debug
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const name = require('./package.json').name;
const debug = require('debug');
exports.getDebugLogger = (ns, scope = name) => {
    const ms = [scope, ns].filter(v => v).join(':');
    return debug(ms);
};
