/**
 * @file serve command plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */


module.exports = {
    id: 'built-in:plugin-serve',
    apply(api, options) {
        api.chainWebpack(webpackConfig => {
            // 在 serve 情况下添加
            webpackConfig.plugin('named-modules-plugin').use(require('webpack/lib/NamedModulesPlugin'));

            // 处理 tpl 的情况，smarty copy 到 output
            webpackConfig.plugin('write-file').use(require('write-file-webpack-plugin'), [{test: /\.tpl$/}]);
        });
    }
};
