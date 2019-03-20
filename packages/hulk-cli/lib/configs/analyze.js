/**
 * @file analyze plguins
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// eslint-disable-next-line
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
// eslint-disable-next-line
const {UnusedFilesWebpackPlugin} = require('unused-files-webpack-plugin');
module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        webpackConfig.plugin('bundle-analyzer').use(new BundleAnalyzerPlugin());
        webpackConfig.plugin('unused-files').use(
            new UnusedFilesWebpackPlugin({
                patterns: ['src/**/*.*'],
                globOptions: {
                    ignore: ['**/*.md', 'node_modules/**/*', 'src/externals/**/*']
                }
            })
        );
    });
};
