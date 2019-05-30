/**
 * @file serve command plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    id: 'command-serve',
    // eslint-disable-next-line
    apply(api, options) {
        api.chainWebpack(webpackConfig => {
            // 在 serve 情况下添加
            const {transformer, formatter} = require('../utils');
            webpackConfig.plugin('named-modules-plugin').use(require('webpack/lib/NamedModulesPlugin'));
            webpackConfig.plugin('friendly-errors').use(require('friendly-errors-webpack-plugin'), [
                {
                    additionalTransformers: [transformer],
                    additionalFormatters: [formatter]
                }
            ]);
            webpackConfig.plugin('write-file').use(require('write-file-webpack-plugin'), [{test: /\.tpl$/}]);
        });
    }
};
