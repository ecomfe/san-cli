/**
 * @file config loader
 * @author ksky521
 */
const parseConfig = require('../lib/parseConfig');
/* eslint-disable space-before-function-paren */
module.exports = function(content) {
    content = parseConfig(this.resourcePath, content);
    return `
        export default ${JSON.stringify(content)};
    `;
};
