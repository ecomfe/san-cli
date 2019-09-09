/**
 * @file init command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.command = 'init';
exports.desc = 'Create an empty repo';
exports.builder = {
    dir: {
        default: '.'
    }
};
exports.handler = argv => {
    console.log('init called for dir', argv);
};
