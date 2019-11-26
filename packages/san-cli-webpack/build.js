/**
 * @file webpack build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const webpack = require('webpack');
const {logger} = require('san-cli-utils/ttyLogger');

const {getWebpackErrorInfoFromStats} = require('./utils');
const log = logger.withTag('webpack/serve');

module.exports = function build({webpackConfig, success, fail}) {
    log.debug('build start', webpackConfig);
    webpack(webpackConfig, (err, stats) => {
        log.debug('build done');

        if (err || stats.hasErrors()) {
            if (fail) {
                fail(getWebpackErrorInfoFromStats(err, stats));
            }

            const isWatch = webpackConfig.watch;

            if (!process.env.SAN_TEST && !isWatch) {
                process.exit(1);
            }
        }

        if (success) {
            success({stats});
        }
    });
};
