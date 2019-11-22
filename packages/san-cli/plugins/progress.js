/**
 * @file progress pugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
module.exports = {
    id: 'built-in:plugin-progress',
    apply(api, projectOptions, options = {}) {
        // 添加progress
        api.chainWebpack(webpackConfig => {
            // 这里留个小功能：bar 颜色随机
            options.color = require('san-cli-utils/randomColor').color;
            webpackConfig.plugin('progress').use(require('webpackbar'), [options]);
        });
    }
};
