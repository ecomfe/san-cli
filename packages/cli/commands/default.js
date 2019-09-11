/**
 * @file default 默认不存在的command 会走到这里来
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const Service = require('@hulk/core/lib/Service');

module.exports = (cmd, argv) => {
    new Service(argv).run(cmd);
};
