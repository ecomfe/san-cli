/**
 * @file 安装 npm，自动区分百度私有包
 */
const debug = require('debug')('command:install');
const {installPackage} = require('../lib/npm');
const {
    log,
    success,
    error,
    clearConsole
} = require('../lib/utils');
module.exports = (context, pkgName, opts, {unknown}) => {
    debug(pkgName, unknown);
    log('📦 开始安装...');
    log();
    installPackage(context, pkgName, unknown, '', true).then(() => {
        clearConsole();
        success('安装完成');
    }).catch(e => {
        error('安装失败');
        log(e);
    });

};
