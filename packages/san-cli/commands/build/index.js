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
        describe: 'Enable webpack-analyze-bunlde'
    },
    'no-clean': {
        type: 'boolean',
        default: false,
        describe: 'Do not delete the dist directory before building'
    },
    'no-colors': {
        alias: 'no-color',
        type: 'boolean',
        default: false,
        describe: 'Colorless log'
    },
    stats: {
        type: 'string',
        default: 'table',
        hidden: true,
        choices: ['none', 'table', 'errors-only', 'minimal', 'normal', 'detailed'],
        describe: 'Show webpack stats params'
    },
    modern: {
        type: 'boolean',
        default: false,
        describe: 'Modern mode'
    },
    'report-json': {
        alias: 'reportJson',
        type: 'boolean',
        hidden: true,
        default: false,
        describe: 'Generate package report as report.json'
    },
    remote: {
        type: 'string',
        alias: 'r',
        describe: 'Send compiled output to the remote target machine'
    },
    report: {
        type: 'boolean',
        default: false,
        describe: 'Generate package report as report.html'
    },
    dest: {
        alias: 'd',
        type: 'string',
        describe: 'Output file path'
    }
};

exports.handler = cliApi => {
    const callback = run.bind(run, cliApi);
    require('../../lib/service')('build', cliApi, callback);
};
