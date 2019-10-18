/**
 * @file default 默认不存在的command 会走到这里来
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
exports.command = '$0';
exports.handler = argv => {
    const Service = require('../lib/Service');
    new Service(process.cwd()).run(process.argv[2], argv, process.argv.slice(2));
};
