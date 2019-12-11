/**
 * @file 全局错误捕获
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable no-console */

const {error: eLog} = require('@baidu/san-cli-utils/ttyLogger');

process.on('uncaughtException', error => {
    eLog(error);
    process.exit(1);
});

process.on('unhandledRejection', error => {
    eLog(error);
    process.exit(1);
});
