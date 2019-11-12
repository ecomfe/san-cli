/**
 * @file 工具函数
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
exports.flatten = arr => arr.reduce((prev, curr) => prev.concat(curr), []);
