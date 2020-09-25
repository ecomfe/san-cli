/**
 * @file 在编辑器中打开项目
 * @author jinzhan
*/
const path = require('path');
const launch = require('launch-editor');
const {info, error} = require('san-cli-utils/ttyLogger');

module.exports = async (options, cwd) => {
    const {line, column} = options;
    cwd = cwd || process.cwd();
    let query = path.resolve(cwd, options.path);
    if (line) {
        query += `:${line}`;
        if (column) {
            query += `:${column}`;
        }
    }
    info(`Opening [${query}] in code editor...`);
    launch(query, 'code', (fileName, errorMsg) => {
        error(`Unable to open [${fileName}]: ${errorMsg}`);
    });
    return true;
};
