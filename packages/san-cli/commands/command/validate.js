/**
 * @file validate
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

function validate(mod) {
    if (mod && typeof mod === 'object') {
        if (typeof mod.handler === 'function' && typeof mod.command === 'string') {
            return true;
        }
    }
    return false;
}

module.exports = validate;
