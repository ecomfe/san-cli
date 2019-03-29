/**
 * @file hulk-lint index
 * @author luzhe <luzhe01@baidu.com>
 */

const path = require('path');
const eslinter = require('./lib/eslinter');
const stylelinter = require('./lib/stylelinter');

module.exports = dir => {
    dir = path.resolve(dir);

    // commitlinter();
    eslinter(dir);
    stylelinter(dir);
};