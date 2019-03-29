/**
 * hulk-lint index
 */

const path = require('path');
const eslinter = require('./lib/eslinter');
const stylelinter = require('./lib/stylelinter');

module.exports = (dir) => {
    dir = path.resolve(dir);

    // commitlinter();
    eslinter(dir);
    stylelinter(dir);
}