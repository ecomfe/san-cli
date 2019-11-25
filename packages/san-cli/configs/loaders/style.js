/**
 * @file style-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const wrapper = require('./loaderWrapper');

module.exports = wrapper(options => {
    return {
        name: 'style-loader',
        loader: require.resolve('style-loader'),
        options
    };
});
