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
        .option('mode', {
            alias: 'm',
            type: 'string',
            default: 'development',
            choices: ['development', 'production'],
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
            default: 'silent',
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
        .epilogue('for more information, find our manual at http://hulk.baidu-int.com');
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
    return {
        /* eslint-disable fecs-camelcase */
        _logger: npmlog,
        _version: pkgVersion,
        _scriptName: scriptName
        /* eslint-enable fecs-camelcase */
    };
}
