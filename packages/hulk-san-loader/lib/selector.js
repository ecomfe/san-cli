/**
 * @file select the right type in runtime
 * @author zhangsiyuan(zhangsiyuan@baidu.com), wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable space-before-function-paren */

const fs = require('fs');
const querystring = require('querystring');
const loaderUtils = require('loader-utils');
const posthtml = require('posthtml');

function getContent(content, type) {
    const __sanParts__ = posthtml([require('./posthtml-san-selector')()]).process(content, {
        sync: true
    }).tree.messages[0];
    return __sanParts__[type].content;
}
module.exports = function(content) {
    const options = loaderUtils.getOptions(this) || {};
    return getContent(content, options.type);
};

// by wyq：提取 markdown 的代码放到 pitch 里面处理是为了分离loader 原功能和 markdown 提取代码功能，减少耦合
// pitch 执行早，所以算是更快吧。。
module.exports.pitch = function(remainingRequest) {
    if (remainingRequest.includes('?')) {
        const [resourcePath, query] = remainingRequest.split('?');
        const q = querystring.parse(query, true);
        if (q.filetype === 'md') {
            let content = fs.readFileSync(resourcePath);
            content = content.toString();
            const m = content.match(/```html\s+(.+?)\s+```/s);
            if (m && m[1]) {
                content = m[1];
            }

            const options = loaderUtils.getOptions(this) || {};
            return getContent(content, options.type);
        }
    }
};
