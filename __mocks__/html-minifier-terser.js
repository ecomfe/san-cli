/**
 * @file html-minifier-terser单测mock
 * @author yanyiting
 */

module.exports = new Proxy({}, {
    get: (target, property) => {
        return jest.fn();
    }
});
