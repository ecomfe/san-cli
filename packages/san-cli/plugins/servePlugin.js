/**
 * @file serve command plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {chalk} = require('san-cli-utils/ttyLogger');
const rules = [
    {
        type: 'cant-resolve-loader',
        re: /Can't resolve '(.*loader)'/,
        msg: (e, match) => `Failed to resolve loader: ${chalk.yellow(match[1])}\nYou may need to install it.`
    }
];

function transformer(error) {
    if (error.webpackError) {
        const message = typeof error.webpackError === 'string' ? error.webpackError : error.webpackError.message || '';
        for (const {re, msg, type} of rules) {
            const match = message.match(re);
            if (match) {
                return Object.assign({}, error, {
                    type,
                    shortMessage: msg(error, match)
                });
            }
        }
        // friendly-error-webpack-plugin 捕捉不到的错误
        if (!error.message) {
            return Object.assign({}, error, {
                type: 'unknown-webpack-error',
                shortMessage: message
            });
        }
    }
    return error;
}

function formatter(errors) {
    errors = errors.filter(e => e.shortMessage);
    if (errors.length) {
        return errors.map(e => e.shortMessage);
    }
}

module.exports = {
    id: 'built-in:plugin-serve',
    apply(api, options) {
        api.chainWebpack(webpackConfig => {
            // 在 serve 情况下添加
            webpackConfig.plugin('named-modules-plugin').use(require('webpack/lib/NamedModulesPlugin'));
            webpackConfig.plugin('friendly-errors').use(require('friendly-errors-webpack-plugin'), [
                {
                    additionalTransformers: [transformer],
                    additionalFormatters: [formatter]
                }
            ]);
            // 处理 tpl 的情况，smarty copy 到 output
            webpackConfig.plugin('write-file').use(require('write-file-webpack-plugin'), [{test: /\.tpl$/}]);
            // 添加 sourcemap
            webpackConfig.devtools
        });
    }
};
