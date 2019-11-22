/**
 * @file friendly errors plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

module.exports = class SanFriendlyErrorsPlugin extends FriendlyErrorsPlugin{
    // 置空，太多 log 了
    displaySuccess() {}
}
