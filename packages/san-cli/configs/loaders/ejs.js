/**
 * @file ejs loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const wrapper = require('./loaderWrapper');

module.exports = wrapper((options, projectOptions) => {
    return {
        name: 'ejs-loader',
        loader: require.resolve('ejs-loader'),
        options
    };
});
