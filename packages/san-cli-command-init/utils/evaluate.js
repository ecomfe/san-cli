/**
 * @file evaluate
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {error} = require('@baidu/san-cli-utils/ttyLogger');
module.exports = (exp, data) => {
    /* eslint-disable no-new-func */
    const fn = new Function('data', 'with (data) { return ' + exp + '}');
    try {
        return fn(data);
    } catch (e) {
        error(`Error when evaluating filter condition: ${exp}`);
    }
};
