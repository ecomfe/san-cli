/**
 * @file lint 代码检查工具
 */

module.exports = async (dir = process.cwd()) => {
    const linter = require('@baidu/hulk-lint');
    linter(dir);
};
