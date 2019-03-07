/**
 * @file init 脚手架初始化
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const action = require('./action');
module.exports = program => {
    program
        .command('init <template> <appName>')
        .description('通过模板初始化项目')
        .option('-o, --offline', '这是一个本地路径')
        .option('-h, --https', 'Git 使用 https 请求')
        .option('-u, --user <user>', 'Git 用户名，默认：git')
        .option('-I, --install', '安装依赖，默认：不安装')
        .option('-f, --force', 'force', '强制删除已存在的目录，默认：删除')
        .option('-r, --registry <registry>', '设置 npm registry')
        .option('-c, --cache', '优先使用缓存')
        .action(action);
};
