/**
 * @file html-minifier-terser单测mock
 * @author yanyiting <yanyiting@baidu.com>
 */

module.exports = new Proxy({}, {
    get: (target, property) => {
        return jest.fn();
    }
});
