/**
 * @file get debug
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const importLazy = require('import-lazy')(require);

const debug = importLazy('debug');

exports.getDebugLogger = (ns, scope = 'hulk') => {
    const ms = [scope, ns].filter(v => v).join(':');
    return debug(ms);
};
