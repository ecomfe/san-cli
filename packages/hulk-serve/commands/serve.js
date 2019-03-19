/**
 * 部分代码来自 vue cli
 * @file serve 主要内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const defaults = {
    host: '0.0.0.0',
    port: 8080,
    https: false
};

module.exports = (api, options) => {
    api.registerCommand('serve', async function serve(args) {});
};

function addDevClientToEntry(config, devClient) {
    const {entry} = config;
    if (typeof entry === 'object' && !Array.isArray(entry)) {
        Object.keys(entry).forEach(key => {
            entry[key] = devClient.concat(entry[key]);
        });
    } else if (typeof entry === 'function') {
        config.entry = entry(devClient);
    } else {
        config.entry = devClient.concat(entry);
    }
}

module.exports.defaultModes = {
    serve: 'development'
};
