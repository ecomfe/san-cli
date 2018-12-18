/**
 * @file 安装 npm，自动区分百度私有包
 */
const {log, success, error, installPackage, clearConsole, getDebugLogger} = require('@baidu/hulk-utils');

const debug = getDebugLogger('command:install', require('../package.json').name);

module.exports = (pkgName, opts, {unknown}) => {
    const context = process.cwd();
    debug(pkgName, unknown);
    log('📦 开始安装...');
    log();
    installPackage(context, pkgName, unknown, '', true)
        .then(() => {
            clearConsole();
            success('安装完成');
        })
        .catch(e => {
            error('安装失败');
            log(e);
        });
};
