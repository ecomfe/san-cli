/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file build command
 * @author ksky521
 */

const run = require('./run');
exports.command = 'build [entry]';
exports.description = 'Compiles an app into an output directory named dist';

exports.builder = {
    watch: {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'Watch mode'
    },
    profile: {
        type: 'boolean',
        describe: 'Enable build profiler'
    },
    analyze: {
        alias: 'analyzer',
        type: 'boolean',
        default: false,
        describe: 'Enable webpack-bundle-analyzer server'
    },
    'no-clean': {
        type: 'boolean',
        default: false,
        describe: 'Do not delete the output directory before building'
    },
    'no-colors': {
        alias: 'no-color',
        type: 'boolean',
        default: false,
        describe: 'Colorless log'
    },
    modern: {
        type: 'boolean',
        default: false,
        describe: 'Modern mode'
    },
    'stats-json': {
        alias: 'stats',
        default: false,
        describe: 'Generate webpack stats JSON file'
    },
    'report': {
        default: false,
        describe: 'Generate bundle report HTML file'
    },
    // 'no-minimize': {
    //     type: 'boolean',
    //     hidden: true,
    //     default: false,
    //     describe: 'Do not open minimize'
    // },
    remote: {
        type: 'string',
        alias: 'r',
        describe: 'Send compiled output to the remote target machine'
    },
    dest: {
        alias: 'd',
        type: 'string',
        describe: 'Output file path'
    }
};

exports.handler = cliApi => {
    if (!cliApi.mode) {
        if (['development', 'production'].includes(process.env.NODE_ENV)) {
            cliApi.mode = process.env.NODE_ENV;
        }
        else {
            cliApi.mode = 'production';
        }
    }
    const callback = run.bind(run, cliApi);
    require('../../lib/service')('build', cliApi, callback);
};
