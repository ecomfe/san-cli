/**
 * @file dev
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

// eslint-disable-next-line
module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = api.isProd();
        /* eslint-disable space-infix-ops,no-unused-vars */
        const args = options._args || {};
        /* eslint-enable space-infix-ops,no-unused-vars */
        if (!isProd) {
            webpackConfig.devtool('cheap-module-eval-source-map').output.publicPath(options.baseUrl);

            webpackConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));

            // https://github.com/webpack/webpack/issues/6642
            webpackConfig.output.globalObject('this');
            webpackConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
        }

        // 在 serve 情况下添加
        if (args.command === 'serve') {
            const {transformer, formatter} = require('../utils');
            webpackConfig.plugin('named-modules-plugin').use(require('webpack/lib/NamedModulesPlugin'));
            webpackConfig.plugin('friendly-errors').use(require('friendly-errors-webpack-plugin'), [
                {
                    additionalTransformers: [transformer],
                    additionalFormatters: [formatter]
                }
            ]);
        }
    });
};
