/**
 * @file 用于 build 和 serve 的通用逻辑处理
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = (argv, plugin) => {
    const Service = require('../lib/Service');
    if (argv.entry) {
        // 存在 entry
    }
    // 处理 rc 文件传入的 Service Class arguments
    let {plugins, useBuiltInPlugin = true, projectOptions} = argv._rcServiceArgs || {};
    if (Array.isArray(plugins)) {
        plugins.push(plugin);
    } else {
        plugins = [plugin];
    }

    return new Service(process.cwd(), {plugins, useBuiltInPlugin, projectOptions});
};
