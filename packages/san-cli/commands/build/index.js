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
        describe: 'watch mode'
    },
    analyze: {
        alias: 'analyzer',
        type: 'boolean',
        default: false,
        describe: 'webpack-analyze-bunlde 模式'
    },
    'no-clean': {
        type: 'boolean',
        default: false,
        describe: '构建之前不删除 dist 目录'
    },
    'no-colors': {
        alias: 'no-color',
        type: 'boolean',
        default: false,
        describe: 'log 不显示颜色'
    },
    stats: {
        type: 'string',
        default: 'table',
        hidden: true,
        choices: ['none', 'table', 'errors-only', 'minimal', 'normal', 'detailed'],
        describe: '显示webpack stats 参数'
    },
    modern: {
        type: 'boolean',
        default: false,
        describe: 'modern 模式打包'
    },
    'report-json': {
        alias: 'reportJson',
        type: 'boolean',
        hidden: true,
        default: false,
        describe: '生成打包报告 report.json'
    },
    remote: {
        type: 'string',
        alias: 'r',
        describe: '将产出发送到 remote 目标机器'
    },
    mode: {
        alias: 'm',
        type: 'string',
        default: 'production',
        choices: ['development', 'production'],
        describe: 'program specifications'
    },
    report: {
        type: 'boolean',
        default: false,
        describe: '生成打包报告 report.html'
    },
    dest: {
        alias: 'd',
        type: 'string',
        describe: '输出文件路径'
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
