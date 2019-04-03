/**
 * @file hulk-lint index
 * @author luzhe <luzhe01@baidu.com>
 */

const path = require('path');
const fecs = require('fecs');

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

};