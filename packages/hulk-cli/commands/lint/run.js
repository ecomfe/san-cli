/**
 * @file lint 代码检查工具
 */

const importLazy = require('import-lazy')(require);
const linter = importLazy('@baidu/hulk-lint');

module.exports = async (dir = process.cwd()) => {
    linter(dir);
}