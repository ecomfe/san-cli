/**
 * @file webpack build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const webpack = require('webpack');
const {getScopeLogger} = require('@baidu/san-cli-utils/ttyLogger');
const SanFriendlyErrorsPlugin = require('./lib/SanFriendlyErrorsPlugin');
const {getWebpackErrorInfoFromStats} = require('./utils');
const log = getScopeLogger('webpack/serve');

module.exports = function build({webpackConfig, compilerCallback}) {
    webpackConfig.plugins.push(new SanFriendlyErrorsPlugin({clearConsole: false}));

    return new Promise((resolve, reject) => {
        log.debug('build start', webpackConfig);
        const compiler = webpack(webpackConfig);

        if (typeof compilerCallback === 'function') {
            compilerCallback(compiler);
        }
        const callback = (err, stats) => {
            if (err || stats.hasErrors()) {
                log.debug(err);
                let errorInfo;
                if (stats.hasErrors()) {
                    errorInfo = stats.toJson();
                    log.debug(errorInfo.errors);
                }

                reject(getWebpackErrorInfoFromStats(err, stats));
                const isWatch = webpackConfig.watch;
                if (isWatch) {
                    log.error(err || errorInfo.errorInfo);
                    process.exit(1);
                }
                return;
            }

            resolve({stats});
        };
        if (webpackConfig.watch === true) {
            const watchOptions = webpackConfig.watchOptions || {};
            return compiler.watch(watchOptions, callback);
        }
        try {
            compiler.run(callback);
        } catch (e) {
            reject(e);
        }
    });
};
