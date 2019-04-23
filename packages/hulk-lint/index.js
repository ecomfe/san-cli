/**
 * @file hulk-lint index
 * @author luzhe <luzhe01@baidu.com>
 */

const path = require('path');
const fecs = require('fecs');
const eslinter = require('./lib/eslinter');

module.exports = dir => {
    dir = path.resolve(dir);

    fecs.check({
        /* eslint-disable */
        _: [dir],
        /* eslint-enable */
        stream: false,
        reporter: 'baidu',
        ignore: ['{node_modules,dist}/*', '*/*.min.*'],
        rule: true,
        color: true
    });

    let {results} = eslinter(dir);
    process.extCode = results.length === 0 ? 0 : 1;
    process.exit();
};
