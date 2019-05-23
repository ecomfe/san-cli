/**
 * @file hulk component
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// alias serve + change (entry + app)
const path = require('path');
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
        .option('-t, --main-template <mainTemplate>', '设置 demo 的 main 模板')
        .option('--qrcode', '显示 url 二维码')
        .option('--use-https', 'use https')
        .action((entry, args) => {
            const serve = require('../serve/run').serve;
            const context = process.cwd();
            let mainTemplate;
            if (args.template) {
                // 下面来检查下 main template 内容是否正确
                const fse = require('fs-extra');
                /* eslint-disable no-unused-vars,fecs-no-require */
                const {error} = require('@baidu/hulk-utils/logger');
                /* eslint-enable no-unused-vars,fecs-no-require */

                mainTemplate = path.resolve(args.template);
                if (fse.existsSync(mainTemplate)) {
                    const content = fse.readFileSync(mainTemplate, {encoding: 'utf8'});
                    if (content.indexOf('~entry') === -1) {
                        // 必须包含~entry 引入啊
                        error(`${args.template} is not include \`~entry\`!`);
                        process.exit(1);
                    }
                } else {
                    // 不存在的哦~
                    error(`${args.template} is not exists!`);
                    process.exit(1);
                }
            } else {
                // 默认情况
                mainTemplate = require.resolve('../../template/webpack/component/main.js');
            }
            // eslint-disable-next-line
            return serve(mainTemplate, path.resolve(context, entry), args, 'component').catch(err => console.log(err));
        });
};
