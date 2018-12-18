/**
 * @file select the right type in runtime
 * @author zhangsiyuan(zhangsiyuan@baidu.com)
 */

const loaderUtils = require('loader-utils');
const posthtml = require('posthtml');

module.exports = function (content) {
    const options = loaderUtils.getOptions(this) || {};
    const __sanParts__ = posthtml([
        require('./posthtml-san-selector')()

    ]).process(content, {
        sync: true
    }).tree.messages[0];

    return __sanParts__[options.type].content;
};
