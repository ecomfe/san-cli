/**
 * @file update 升级 npm，自动区分百度私有包
 */
const debug = require('debug')('command:install');
const {updatePackage} = require('../lib/npm');
const {
    logWithSpinner,
    stopSpinner,
    log,
    error,
    clearConsole
} = require('../lib/utils');
module.exports = (context, pkgName, opts, argv) => {
    debug(pkgName, argv);
    logWithSpinner('📦', `升级中...`);
    updatePackage(context, pkgName, argv.filter(a => {
        a !== 'install';
    })).then(() => {
        stopSpinner();
        clearConsole();
        log('✌️ 升级完成');
    }).catch(e => {
        stopSpinner();
        error('升级失败');
        log(e);
    });

};
