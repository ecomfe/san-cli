/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file serve command
 * @author ksky521
 */

exports.command = 'serve [entry]';
exports.description = 'Build and serve your app, rebuilding on file changes';
exports.builder = {
    'no-progress': {
        type: 'boolean',
        default: false,
        hidden: true,
        describe: 'Do not show the progress bar'
    },
    config: {
        alias: 'config-file',
        type: 'string',
        hidden: true,
        describe: 'Project config file'
    },
    mode: {
        alias: 'm',
        hidden: true,
        type: 'string',
        choices: ['development', 'production'],
        describe: 'Operating environment'
    },
    profile: {
        alias: 'profiler',
        hidden: true,
        type: 'boolean',
        default: false,
        describe: 'Show Webpack profiler log'
    },
    dashboard: {
        hidden: true,
        type: 'boolean',
        default: false,
        describe: 'To send ipc message to ui-dashboard'
    },
    https: {
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
    },
    esm: {
        type: 'boolean',
        default: false,
        describe: 'Acceleration using esmodule'
    }
};

exports.handler = argv => {
    if (!argv.mode) {
        if (['development', 'production'].includes(process.env.NODE_ENV)) {
            argv.mode = process.env.NODE_ENV;
        }
        else {
            argv.mode = 'development';
        }
    }
    const projectOptions = {
        loaderOptions: {
            esbuild: argv.esm
        }
    };
    const Service = require('san-cli-service');
    const service = new Service(process.cwd(), {
        watch: argv.watch,
        useDashboard: argv.dashboard,
        projectOptions
    });
    const run = require('./run');
    service.run('serve', argv).then(run.bind(run, argv));
};
