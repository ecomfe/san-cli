/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file friendly errors plugin
 * @author ksky521
 */
const {textCommonColor} = require('san-cli-utils/color');
const SError = require('san-cli-utils/SError');
const {error, chalk, warn, clearConsole} = require('san-cli-utils/ttyLogger');
const friendlySyntaxErrorLabel = 'Syntax error:';
const lineRules = [
    [
        /Line (\d+):(?:(\d+):)?\s*Parsing error: (.+)$/,
        match => `${friendlySyntaxErrorLabel} ${match[3]} (${match[1]}:${match[2]})`
    ],
    [
        /Can't resolve '(.*loader)'/,
        match => `Failed to resolve loader: ${textCommonColor(match[1])}\n` + '  You may need to install it.\n'
    ],
    [
        /Can't resolve '(.*(html|htm|tpl))'/,
        match =>
            `Failed to resolve page: ${textCommonColor(match[1])}\n` + '  You may need to check you configuration.\n'
    ]
];
const msgReplaces = [
    [
        /SyntaxError\s+\((\d+):(\d+)\)\s*(.+?)\n/g,
        `${friendlySyntaxErrorLabel} $3 ($1:$2)\n`
    ],
    [
        /^.*export '(.+?)' was not found in '(.+?)'.*$/gm,
        m => `Attempted import error: ${textCommonColor(m[1])} is not exported from ${textCommonColor(m[2])}.`
    ],
    [
        /^.*export 'default' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
        m => `Attempted import error: ${
            textCommonColor(m[2])
        } does not contain a default export (imported as ${textCommonColor(m[1])}).`
    ],
    [
        /^.*export '(.+?)' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
        m => `Attempted import error: ${
            textCommonColor(m[1])
        } is not exported from ${textCommonColor(m[3])} (imported as ${textCommonColor(m[2])}).`
    ]
];

function isLikelyASyntaxError(message) {
    return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

// Cleans up webpack error messages.
function formatMessage(message) {
    // 兼容webpack5升级
    if (typeof message === 'object') {
        message = Object.values(message).join('\n');
    }

    let lines = message.split('\n');

    // Strip webpack-added headers off errors/warnings
    // https://github.com/webpack/webpack/blob/master/lib/ModuleError.js
    lines = lines.filter(line => !/Module [A-z ]+\(from/.test(line));

    for (const [re, match] of lineRules) {
        lines = lines.map(line => {
            const m = re.exec(line);
            if (!m) {
                return line;
            }
            return match(m);
        });
    }

    message = lines.join('\n');
    for (const [re, replace] of msgReplaces) {
        message = message.replace(re, replace);
    }
    lines = message.split('\n');

    // Remove leading newline
    if (lines.length > 2 && lines[1].trim() === '') {
        lines.splice(1, 1);
    }
    // Clean up file name
    lines[0] = lines[0].replace(/^(.*) \d+:\d+-\d+$/, '$1');

    // Cleans up verbose "module not found" messages for files and packages.
    if (lines[1] && lines[1].indexOf('Module not found: ') === 0) {
        lines = [
            lines[0],
            lines[1].replace('Error: ', '').replace('Module not found: Cannot find file:', 'Cannot find file:')
        ];
    }

    // Add helpful message for users trying to use Sass for the first time
    if (lines[1] && lines[1].match(/Cannot find module.+node-sass/)) {
        lines[1] = 'To import Sass files, you first need to install node-sass.\n';
        lines[1] += 'Run `npm install node-sass` or `yarn add node-sass` inside your workspace.';
    }
    // Remove duplicated newlines
    lines = lines.filter(
        (line, index, arr) => index === 0 || line.trim() !== '' || line.trim() !== arr[index - 1].trim()
    );

    // Reassemble the message
    message = lines.join('\n');
    return message.trim();
}

function formatWebpackMessages(json) {
    const formattedErrors = json.errors.map(function (message) {
        return formatMessage(message, true);
    });
    const formattedWarnings = json.warnings.map(function (message) {
        return formatMessage(message, false);
    });
    const result = {errors: formattedErrors, warnings: formattedWarnings};
    if (result.errors.some(isLikelyASyntaxError)) {
        // If there are any syntax errors, show just them.
        result.errors = result.errors.filter(isLikelyASyntaxError);
    }
    return result;
}
function showError(arr) {
    clearConsole();
    error(chalk.red(`[SanFriendlyErrorsPlugin]Failed to compile with ${arr.length} errors.`));
    arr.forEach(message => {
        const lines = message.split('\n');

        const typeRegExp = /^([A-Z]\w+)Error:\s*(.+?)$/;
        const typeMatch = typeRegExp.exec(lines[1]);
        if (typeMatch) {
            const e = new SError(typeMatch[2], typeMatch[1] + 'Error', lines.splice(2));
            error(e);
        }
        else {
            error(lines[0]);
            console.log(lines.splice(1).join('\n'));
        }
    });


}
function showWarning(arr) {
    arr.forEach(err => warn(err));
    warn(`Compiled with ${arr.length} warnings.`);
}

module.exports = class SanFriendlyErrorsPlugin {
    apply(compiler) {
        const done = stats => {
            const hasErrors = stats.hasErrors();
            const hasWarnings = stats.hasWarnings();

            if (!hasErrors && !hasWarnings) {
                return;
            }

            const messages = formatWebpackMessages(stats.toJson({}, true));

            if (hasErrors) {
                return showError(messages.errors);
            }
            if (hasWarnings) {
                showWarning(messages.warnings);
            }
        };

        // 添加 hook
        if (compiler.hooks) {
            const plugin = {name: 'SanFriendlyErrorsPlugin'};

            compiler.hooks.done.tap(plugin, done);
        }
        else {
            compiler.plugin('done', done);
        }
    }
};
