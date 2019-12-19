/**
 * @file webpack build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const webpack = require('webpack');
const {logger} = require('@baidu/san-cli-utils/ttyLogger');

const {getWebpackErrorInfoFromStats} = require('./utils');
const log = logger.withTag('webpack/serve');

module.exports = function build({webpackConfig, compilerCallback}) {
    return new Promise((resolve, reject) => {
        log.debug('build start', webpackConfig);
        const compiler = webpack(webpackConfig);

        if (typeof compilerCallback === 'function') {
            compilerCallback(compiler);
        }
        const callback = (err, stats) => {
            log.debug('build done');
            if (err || stats.hasErrors()) {
                log.debug(err);
                log.debug(stats);
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
        compiler.run(callback);
    });
};
