/**
 * @file 交互式问询
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const inquirer = require('inquirer');

module.exports = (input, done) => {
    if (!Array.isArray(input)) {
        input = [input];
    }
    return inquirer.prompt(input);
};
