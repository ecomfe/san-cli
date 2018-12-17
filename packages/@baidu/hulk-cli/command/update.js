/**
 * @file update 升级 npm，自动区分百度私有包
 */
const {updatePackage} = require('../lib/npm');
const {log, success, error, clearConsole, getDebugLogger} = require('@baidu/hulk-utils');
const debug = getDebugLogger('command:update', require('../package.json').name);

module.exports = (pkgName, opts, {unknown}) => {
    const context = process.cwd();
    debug(pkgName, unknown);
    log('📦 开始升级...');
    log();
    updatePackage(context, pkgName, unknown, '', true)
        .then(() => {
            clearConsole();
            success('升级完成');
        })
        .catch(e => {
            error('升级失败');
            log(e);
        });
};
