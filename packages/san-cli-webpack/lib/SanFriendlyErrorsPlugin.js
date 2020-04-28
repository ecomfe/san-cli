/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file friendly errors plugin
 * @author ksky521
 */

const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const {textColor} = require('san-cli-utils/randomColor');

// 这里处理 loader 缺失的问题
const rules = [
    {
        type: 'Cant-find-node-sass',
        re: /Cannot find module.+node-sass/,
        msg: match => `To import Sass files, you first need to install node-sass.
Run \`npm install node-sass\` or \`yarn add node-sass\` inside your workspace.`
    },
    {
        type: 'Parse-error',
        re: /Line (\d+):(?:(\d+):)?\s*Parsing error: (.+)$/,
        msg: ([, errorLine, errorColumn, errorMessage]) => `Syntax error: ${errorMessage} (${errorLine}:${errorColumn})`
    },
    {
        type: 'Export-not-found',
        re: /^.*export '(.+?)' was not found in '(.+?)'.*$/gm,
        msg: match => `Attempted import error: \'${match[1]}\' is not exported from \'${match[2]}\'.`
    },
    {
        type: 'Export-export-error',
        re: /^.*export 'default' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
        // eslint-disable-next-line max-len
        msg: ([, $1, $2]) => `Attempted import error: \'${$1}\' does not contain a default export (imported as \'${$2}\').`
    },
    {
        type: 'Export-error',
        re: /^.*export '(.+?)' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
        // eslint-disable-next-line max-len
        msg: ([, $1, $2, $3]) => `Attempted import error: \'${$1}\' is not exported from \'${$3}\' (imported as \'${$2}\').`
    },
    {
        type: 'cant-resolve-loader',
        re: /Can't resolve '(.*loader)'/,
        msg: (e, match) => `  Failed to resolve loader: ${textColor(match[1])}\n` + '  You may need to install it.\n'
    },
    {
        type: 'cant-resolve-html',
        re: /Can't resolve '(.*(html|htm|tpl))'/,
        msg: (e, match) =>
            `  Failed to resolve page: ${textColor(match[1])}\n` + '  You may need to check you configuration.\n'
    }
];
const defaultTransformers = [
    error => {
        if (error.webpackError) {
            /* eslint-disable operator-linebreak */
            const message =
                typeof error.webpackError === 'string' ? error.webpackError : error.webpackError.message || '';

            for (const {re, msg, type} of rules) {
                const match = message.match(re);
                if (match) {
                    return Object.assign(error || {}, {
                        type,
                        shortMessage: msg(error, match)
                    });
                }
            }
            if (!error.message) {
                return Object.assign(error || {}, {
                    type: 'unknown-webpack-error',
                    shortMessage: message
                });
            }
        }
        return error;
    }
];

const defaultFormatters = [
    errors => {
        errors = errors.filter(e => e.shortMessage);
        if (errors.length) {
            return errors.map(e => e.shortMessage);
        }
    }
];

module.exports = class SanFriendlyErrorsPlugin extends FriendlyErrorsPlugin {
    constructor(options = {}) {
        const additionalFormatters = options.additionalFormatters || [];
        const additionalTransformers = options.additionalTransformers || [];
        options.additionalFormatters = [...defaultFormatters, ...additionalFormatters];
        options.additionalTransformers = [...defaultTransformers, ...additionalTransformers];
        super(options);
    }

    // 置空，太多 log 了
    displaySuccess() {}
};
