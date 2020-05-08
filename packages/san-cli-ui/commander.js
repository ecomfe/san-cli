/**
 * @file command Component
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
exports.builder = {
    port: {
        alias: 'p',
        default: 8333,
        type: 'number',
        describe: 'Port number of the URL'
    },
    open: {
        alias: 'O',
        type: 'boolean',
        default: false,
        describe: 'Open Browser after the build is complete'
    },
    host: {
        alias: 'H',
        type: 'string',
        describe: 'Hostname of the URL'
    }
};
exports.description = 'San CLI UI';
exports.command = 'ui';

exports.handler = cliApi => {
    const {host, port} = cliApi;
    const distPath = path.join(__filename, './dist');
    const publicPath = path.join(__filename, './public');

    const createServer = require('./server/');
    createServer({host, port, distPath, publicPath})
        .then(({host, port}) => {
            const networkUrl = `http://${host}:${port}`;
            const {textColor} = require('san-cli-utils/randomColor');
            /* eslint-disable no-console */
            console.log();
            console.log(`  Application is running at: ${textColor(networkUrl)}`);
            console.log('  URL QRCode is: ');
            // 打开浏览器地址
            cliApi.open && require('opener')(networkUrl);
        })
        .catch(e => {
            console.log(e);
        });
};
