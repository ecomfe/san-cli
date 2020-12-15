/**
 * @file 在编辑器中打开项目
 * @author jinzhan, Lohoyo
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
    let returnMsg = '';
    launch(query, 'code', (fileName, errorMsg) => {
        returnMsg = `Unable to open [${fileName}]: ${errorMsg}`;
        error(returnMsg);
    });
    // 等上面的 launch 函数的回调执行完
    await new Promise(resolve => {
        setTimeout(resolve, 1000);
    });
    return returnMsg;
};
