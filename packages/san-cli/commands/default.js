/**
 * @file default 默认不存在的command 会走到这里来
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
exports.command = '$0';
exports.handler = argv => {
    // 添加插件
    const cmdDoc = require('@baidu/san-cli-docit');
    const plugins = [cmdDoc];
    const getService = require('../lib/getServiceInstance');
    const service = getService(argv, plugins);
    service.run(process.argv[2], argv, process.argv.slice(2));
};
