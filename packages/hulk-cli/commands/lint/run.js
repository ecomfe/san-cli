/**
 * @file lint 代码检查工具
 */

module.exports = (dir = process.cwd()) => {
    const linter = require('@baidu/hulk-lint');
    linter(dir);
};
