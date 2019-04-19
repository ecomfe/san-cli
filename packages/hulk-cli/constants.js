/**
 * @file 常数变量
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* global Set */
exports.NPM_REGISTRY = 'http://registry.npm.baidu-int.com';
// 不自动更新的库，黑名单
exports.POSSIBLE_BREAKING_PACKAGES = new Set();
// 默认 browserslist
exports.BROWSERS_LIST = ['defaults', 'not ie < 11', 'last 2 versions', '> 1%', 'iOS 7', 'last 3 iOS versions'];
// 支持的环境
exports.ENV = ['production', 'development'];

exports.DEVELOPMENT_MODE = 'development';
exports.PRODUCTION_MODE = 'production';
