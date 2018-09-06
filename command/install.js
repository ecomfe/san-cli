/**
 * @file 安装 npm，自动区分百度私有包
 */
const debug = require('debug')('command:install');
const {installPackage} = require('../lib/npm');
const {
    logWithSpinner,
    stopSpinner,
    log,
    error,
    clearConsole
} = require('../lib/utils');
module.exports = (context, pkgName, opts, argv) => {
    debug(pkgName, argv);
    logWithSpinner('📦', '安装中...');
    installPackage(context, pkgName, argv.filter(a => {
        a !== 'install';
    })).then(() => {
        stopSpinner();
        clearConsole();
        log('✌️ 安装完成');
    }).catch(e => {
        stopSpinner();
        error('安装失败');
        log(e);
    });

};
