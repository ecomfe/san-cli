/**
 * @file init 脚手架初始化
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const run = require('./run');
module.exports = program => {
    program
        .command('init <template> <appName>')
        .alias('new')
        .description('通过项目脚手架生成项目')
        .option('--offline', '标示 template 是离线的脚手架')
        .option('--use-https', 'Git 使用 https 请求')
        .option('--install', '初始化成功后，进入目录安装依赖，默认：不安装')
        .option('--force', '跳过提醒，强制删除已存在的目录，默认会提醒')
        .option('--use-cache', '优先使用本地已经下载过的脚手架缓存')
        .option('--user <user>', '指定 Git 用户名，默认：git')
        .option('--registry <registry>', '设置 npm registry') // 提到全局flag
        .action(run);
};
