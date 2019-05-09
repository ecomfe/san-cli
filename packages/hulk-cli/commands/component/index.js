/**
 * @file hulk component
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// alias serve + change (entry + app)
const {ENV, DEVELOPMENT_MODE} = require('../../constants');

module.exports = program => {
    const envReg = new RegExp('^(' + ENV.join('|') + ')$', 'i');

    program
        .command('component <entry>')
        .alias('md')
        .description('San 组件 Demo 预览服务器')
        .option('-p, --port <port>', 'dev server port', /\d+/)
        .option('-h, --host <host>', 'dev server host')
        .option('-m, --mode <mode>', '指定 webpack mode', envReg, DEVELOPMENT_MODE)
        .option('-c, --config <config>', '设置  webpack config 文件')
        .option('--use-https', 'use https')
        .action((entry, args) => {
            const serve = require('../serve/run').serve;
            const path = require('path');
            const context = process.cwd();

            return serve(
                require.resolve('../../template/webpack/component/main.js'),
                path.resolve(context, entry),
                args,
                'component'
            );
        });
};
