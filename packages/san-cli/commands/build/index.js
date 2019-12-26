/**
 * @file build command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const getHandler = require('./run');
const command = (exports.command = 'build [entry]');
const description = (exports.description = 'build description');

const builder = (exports.builder = {
    watch: {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'Watch mode'
    },
    profile: {
        type: 'boolean',
        describe: 'Enable build profiler'
    },
    config: {
        alias: 'config-file',
        type: 'string',
        describe: 'Project config file'
    },
    analyze: {
        alias: 'analyzer',
        type: 'boolean',
        default: false,
        describe: 'Enable webpack-analyze-bunlde'
    },
    'no-clean': {
        type: 'boolean',
        default: false,
        describe: 'Do not delete the dist directory before building'
    },
    'no-colors': {
        alias: 'no-color',
        type: 'boolean',
        default: false,
        describe: 'Colorless log'
    },
    stats: {
        type: 'string',
        default: 'table',
        hidden: true,
        choices: ['none', 'table', 'errors-only', 'minimal', 'normal', 'detailed'],
        describe: 'Show webpack stats params'
    },
    modern: {
        type: 'boolean',
        default: false,
        describe: 'Modern mode'
    },
    'report-json': {
        alias: 'reportJson',
        type: 'boolean',
        hidden: true,
        default: false,
        describe: 'Generate package report as report.json'
    },
    remote: {
        type: 'string',
        alias: 'r',
        describe: 'Send compiled output to the remote target machine'
    },
    mode: {
        alias: 'm',
        type: 'string',
        default: 'production',
        choices: ['development', 'production'],
        describe: 'Operating environment'
    },
    report: {
        type: 'boolean',
        default: false,
        describe: 'Generate package report as report.html'
    },
    dest: {
        alias: 'd',
        type: 'string',
        describe: 'Output file path'
    }
});
const buildPlugin = {
    id: 'san-cli-command-build',
    apply(api, projectOptions) {
        // 注册命令
        api.registerCommand(command, {
            builder,
            description,
            handler: getHandler(api, projectOptions)
        });
    }
};
exports.handler = argv => {
    const getService = require('../../lib/getServiceInstance');
    const service = getService(argv, buildPlugin);
    service.run('build', argv);
};

exports.buildPlugin = buildPlugin;
