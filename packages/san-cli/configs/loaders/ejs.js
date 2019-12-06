/**
 * @file ejs loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const factory = require('./loaderFactory');

module.exports = factory((options, projectOptions) => {
    return {
        name: 'ejs-loader',
        loader: require.resolve('ejs-loader'),
        options
    };
});
