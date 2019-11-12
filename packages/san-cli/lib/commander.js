/**
 * @file yargs instance
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const yargs = require('yargs/yargs');
const npmlog = require('npmlog');
const {scriptName, version: pkgVersion} = require('../package.json');

module.exports = () => {
    const cli = yargs();
    cli.scriptName(scriptName)
        .usage('Usage: $0 <command> [options]')
        .option('verbose', {
            type: 'boolean',
            describe: 'output verbose messages on internal operations'
        })
        .option('config-file', {
            alias: 'config',
            type: 'string',
            describe: 'program specifications'
        })
        .option('no-progress', {
            type: 'boolean',
            default: false,
            hidden: true,
            describe: 'program specifications'
        })
        .option('log-level', {
            alias: 'logLevel',
            default: 'error',
            hidden: true,
            choices: ['info', 'debug', 'warn', 'error', 'silent', 'notice', 'silly', 'timing', 'http'],
            type: 'string',
            describe: 'set log level'
        })
        .wrap(cli.terminalWidth() - 30)
        .middleware(getCommonArgv)
        .help()
        .alias('help', 'h')
        .alias('version', 'v')
        .epilogue('for more information, find our manual at http://ecomfe.github.com/san-cli');
    return cli;
};

function getCommonArgv(argv) {
    // 利用中间件机制，增加公共参数处理和函数等
    if (argv.verbose) {
        // 增加 logger
        npmlog.level = 'info';
    } else {
        npmlog.level = argv.logLevel;
    }
    // // 让他增加 prefix 返回函数用法，实现 debug 功能
    const logger = (prefix, level = 'info') => (...args) => npmlog[level](prefix, ...args);

    Object.keys(npmlog).forEach(key => {
        if (typeof npmlog[key] === 'function') {
            logger[key] = (...args) => npmlog[key](...args);
        }
    });
    return {
        /* eslint-disable fecs-camelcase */
        _logger: logger,
        _version: pkgVersion,
        _scriptName: scriptName
        /* eslint-enable fecs-camelcase */
    };
}
