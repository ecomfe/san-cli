/**
 * @file html-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const factory = require('./loaderFactory');
module.exports = factory(
    (options, projectOptions) => {
        return {
            name: 'html-loader',
            loader: require.resolve('html-loader'),
            options
        };
    },
    {
        attrs: [':data-src']
    }
);
