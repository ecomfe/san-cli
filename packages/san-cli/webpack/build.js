/**
 * @file webpack build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const webpack = require('webpack');
const {debug, getWebpackErrorInfoFromStats} = require('../lib/ttyLogger');
const log = debug('webpack/build');

module.exports = function build({webpackConfig, success, fail}) {
    log.info('start');
    webpack(webpackConfig, (err, stats) => {
        log.info('done');

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
