/**
 * @file get debug
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const debug = require('debug');
exports.getDebugLogger = (ns, scope = 'hulk') => {
    const ms = [scope, ns].filter(v => v).join(':');
    return debug(ms);
};
