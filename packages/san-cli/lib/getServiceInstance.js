/**
 * @file 用于 build 和 serve 的通用逻辑处理
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = (argv, plugins) => {
    const Service = require('./Service');

    if (!Array.isArray(plugins)) {
        plugins = [plugins];
    }

    return new Service(process.cwd(), {plugins});
};
