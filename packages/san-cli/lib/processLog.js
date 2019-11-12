/**
 * @file 全局错误捕获
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable no-console */

const {error: eLog} = require('san-cli-utils/ttyLogger');

process.on('uncaughtException', error => {
    eLog(`Uncaught exception: ${error}`);
    if (error && error.stack) {
        console.log(error.stack);
    }
    process.exit(1);
});

process.on('unhandledRejection', error => {
    eLog(`Promise rejection: ${error}`);

    if (error && error.stack) {
        console.log(error.stack);
    }
    process.exit(1);
});
