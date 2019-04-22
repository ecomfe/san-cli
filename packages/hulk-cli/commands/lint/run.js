/**
 * @file lint 代码检查工具
 */

module.exports = (dir = process.cwd(), opts) => {

    if (opts.install) {
        const installer = require('@baidu/hulk-lint/lib/installer');
        installer(dir);
    }
    else {
        const linter = require('@baidu/hulk-lint');
        linter(dir);
    }
};
