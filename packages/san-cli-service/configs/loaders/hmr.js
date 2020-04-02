/**
 * @file hmr loader options
 * @author tanglei02 <tanglei02@baidu.com>
 */
const factory = require('./loaderFactory');

module.exports = factory((options, projectOptions) => {
    return {
        name: 'san-hot-loader',
        loader: '@baidu/san-hot-loader',
        options
    };
});
