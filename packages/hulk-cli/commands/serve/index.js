/**
 * @file hulk serve
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const run = require('./run');
const {ENV, DEVELOPMENT_MODE} = require('../../constants');

module.exports = program => {
    const envReg = new RegExp('^(' + ENV.join('|') + ')$', 'i');
    program
        .command('serve [entry]')
        .alias('dev')
        .description('0配置针对 a .js / .san 文件启动开发模式编译')
        .option('-p, --port <port>', 'dev server 端口号', /\d+/)
        .option('-h, --host <host>', 'dev server host')
        .option('-m, --mode <mode>', '指定 webpack mode', envReg, DEVELOPMENT_MODE)
        .option('-c, --config <config>', '指定 webpack config 文件')
        .option('--use-https', '使用 https')
        .option('--qrcode', '显示 url 二维码')
        .action(run);
};
