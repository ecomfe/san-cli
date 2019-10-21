/**
 * @file Error class
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
module.exports = class SError extends Error {
    constructor(msg) {
        super(msg || 'San error');
        this.name = 'SError';
        Error.captureStackTrace(this, SError);
    }
};
