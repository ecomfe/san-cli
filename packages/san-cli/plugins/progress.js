/**
 * @file progress pugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    id: 'built-in:plugin-progress',
    apply(api) {
        // 添加progress
        api.chainWebpack(webpackConfig => {
            webpackConfig.plugin('progress').use(require('webpack/lib/ProgressPlugin'));
        });
    }
};
