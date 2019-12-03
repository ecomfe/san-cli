/**
 * @file validate
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

function validate(mod) {
    if (mod && typeof mod === 'object') {
        if (typeof mod.apply === 'function' && typeof mod.id === 'string') {
            return true;
        }
    }
    return false;
}

module.exports = validate;
