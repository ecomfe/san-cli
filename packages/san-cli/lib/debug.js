/**
 * @file debug log
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {getScopeLogger} = require('san-cli-utils/ttyLogger');
module.exports = prefix => {
    return getScopeLogger(prefix, process.env.CONSOLA_LEVEL);
};
