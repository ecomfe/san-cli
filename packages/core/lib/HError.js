/**
 * @file Error class
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
module.exports = class HError extends Error {
    constructor(msg) {
        super(msg || 'hulk error');
        this.name = 'HError';
        Error.captureStackTrace(this, HError);
    }
};
