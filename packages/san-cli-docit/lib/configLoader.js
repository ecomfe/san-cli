/**
 * @file config loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const parseConfig = require('./parseConfig');
/* eslint-disable space-before-function-paren */
module.exports = function(content) {
    content = parseConfig(this.resourcePath, content);
    return `
        export default ${JSON.stringify(content)};
    `;
};
