/**
 * @file default 默认不存在的command 会走到这里来
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const Service = require('@hulk/core/lib/Service');

module.exports = (cli, cmd, argv) => {
    new Service(process.cwd(), {cli}).runCommand(cmd, argv);
};
