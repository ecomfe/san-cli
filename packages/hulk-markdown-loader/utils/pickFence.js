/**
 * @file 提取 html 代码
 */
const loaderUtils = require('loader-utils');
const fs = require('fs');
function loader(content) {
    const config = loaderUtils.getOptions(this);
    const url = config.url;

    content = fs.readFileSync(url);
    content = content.toString();
    const m = content.match(/```html\s+(.+?)\s+```/s);
    if (!m) {
        return content;
    }
    return m[1];
}

module.exports = loader;
