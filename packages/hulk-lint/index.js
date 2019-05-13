/**
 * @file hulk-lint index
 * @author luzhe <luzhe01@baidu.com>
 */

const path = require('path');
const fecs = require('fecs');
const eslinter = require('./lib/eslinter');

module.exports = dirs => {
    if (!Array.isArray(dirs)) {
        dirs = [dirs];
    }

    dirs = dirs.map(dir => path.resolve(dir));

    fecs.check({
        /* eslint-disable */
        _: dirs,
        /* eslint-enable */
        stream: false,
        reporter: 'baidu',
        ignore: ['{node_modules,dist}/*', '*/*.min.*'],
        rule: true,
        color: true
    });

    let {errorCount} = eslinter(dirs);
    if (errorCount && errorCount !== 0) {
        process.exitCode = 1;
        process.exit();
    }

};
