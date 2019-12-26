/**
 * @file webpack build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const webpack = require('webpack');
const {getScopeLogger} = require('@baidu/san-cli-utils/ttyLogger');

const {getWebpackErrorInfoFromStats} = require('./utils');
const log = getScopeLogger('webpack/serve');

module.exports = function build({webpackConfig, compilerCallback}) {
    return new Promise((resolve, reject) => {
        log.debug('build start', webpackConfig);
        const compiler = webpack(webpackConfig);

        if (typeof compilerCallback === 'function') {
            compilerCallback(compiler);
        }
        const callback = (err, stats) => {
            if (err || stats.hasErrors()) {
                log.debug(err);
                if (stats.hasErrors()) {
                    const info = stats.toJson();
                    log.debug(info.errors);
                }

                reject(getWebpackErrorInfoFromStats(err, stats));
                const isWatch = webpackConfig.watch;
                if (!process.env.SAN_DEBUG && !isWatch) {
                    process.exit(1);
                }
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
