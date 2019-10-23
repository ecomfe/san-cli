/**
 * @file html-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const wrapper = require('./loaderWrapper');
module.exports = wrapper(
    (options, projectOptions) => {
        return {
            name: 'html-loader',
            loader: 'html-loader',
            options
        };
    },
    {
        attrs: [':data-src']
    }
);
