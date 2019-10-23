/**
 * @file loader 包裹函数，将参数规范好，loader 直接用
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const defaultsDeep = require('lodash.defaultsdeep');

module.exports = (loaderFn, defaultOptions = {}) => (options = {}, projectOptions = {}, api) =>
    loaderFn(defaultsDeep(defaultOptions, options), projectOptions, api);
