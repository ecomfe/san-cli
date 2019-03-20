/**
 * @file analyze plguins
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// eslint-disable-next-line
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
module.exports = {
    id: 'analyze',
    apply: (api, options) => {
        api.chainWebpack(webpackConfig => {
            webpackConfig.plugin('bundle-analyzer').use(new BundleAnalyzerPlugin());
        });
    }
};
