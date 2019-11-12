/**
 * @file 将 serve 的 getNormalWbpackConfig
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
module.exports = function getNormalizeWebpackConfig(api, projectOptions, argv) {
    const resolveEntry = require('../../lib/resolveEntry');

    // 开始正式的操作
    let webpackConfig = api.resolveWebpackConfig();
    const entry = argv.entry;

    webpackConfig = resolveEntry(entry, api.resolve(entry), webpackConfig);
    return webpackConfig;
};
