/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file serve command
 * @author ksky521
 */

const run = require('./run');
exports.command = 'serve [entry]';
exports.description = 'Builds and serves your app, rebuilding on file changes';
exports.builder = {
    'https': {
        type: 'boolean',
        default: false,
        describe: 'Enable https'
    },
    public: {
        type: 'string',
        describe: 'Specify the public network URL for the HMR client'
    },
    port: {
        alias: 'p',
        type: 'number',
        describe: 'Port number of the URL'
    },
    open: {
        alias: 'O',
        type: 'boolean',
        default: false,
        describe: 'Open Browser'
    },
    host: {
        alias: 'H',
        type: 'string',
        describe: 'Hostname of the URL'
    },
    qrcode: {
        type: 'boolean',
        default: true,
        describe: 'Print out the QRCode of the URL'
    }
};

exports.handler = cliApi => {
    if (!cliApi.mode) {
        if (['development', 'production'].includes(process.env.NODE_ENV)) {
            cliApi.mode = process.env.NODE_ENV;
        }
        else {
            cliApi.mode = 'development';
        }
    }
    const callback = run.bind(run, cliApi);

    require('../../lib/service')('serve', cliApi, callback);
};
