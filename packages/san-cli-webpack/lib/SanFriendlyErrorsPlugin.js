/**
 * @file friendly errors plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const {textColor} = require('san-cli-utils/randomColor');

// 这里处理 loader 缺失的问题
const rules = [
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
                    return Object.assign({}, error, {
                        type,
                        shortMessage: msg(error, match)
                    });
                }
            }
            if (!error.message) {
                return Object.assign({}, error, {
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
