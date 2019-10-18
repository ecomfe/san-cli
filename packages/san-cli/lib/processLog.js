/**
 * @file 全局错误捕获
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable no-console */

const {error} = require('./ttyLogger');

process.on('uncaughtException', error => {
    error(`Uncaught exception: ${error}`);
    if (error && error.stack) {
        console.log(error.stack);
    }
    process.exit(1);
});

process.on('unhandledRejection', error => {
    error(`Promise rejection: ${error}`);

    if (error && error.stack) {
        console.log(error.stack);
    }
    process.exit(1);
});
