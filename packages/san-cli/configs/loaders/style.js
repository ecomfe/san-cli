/**
 * @file style-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const factory = require('./loaderFactory');

module.exports = factory(options => {
    return {
        name: 'style-loader',
        loader: 'style-loader',
        options
    };
});
