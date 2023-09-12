/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file deploy
 */

const {logger, chalk} = require('san-cli-utils/ttyLogger');

exports.command = 'deploy [target]';
exports.description = 'Send file to the remote target machine';
exports.builder = {
    watch: {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'Watch mode'
    },
    config: {
        alias: 'c',
        type: 'string',
        describe: 'Deploy config file'
    }
};

exports.handler = argv => {
    if (!argv.target) {
        logger.error(chalk.red('Deploy target not found, please set [target]'));
        return;
    }
    require('./run')(argv);
};
