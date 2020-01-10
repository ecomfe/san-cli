/**
 * @file eslint
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const factory = require('./loaderFactory');

module.exports = factory(
    options => {
        return {
            name: 'eslint',
            loader: 'eslint-loader',
            options
        };
    },
    {
        root: true,
        env: {browser: true, es6: true, node: true, worker: true, commonjs: true},
        parser: 'babel-eslint',
        parserOptions: {
            allowImportExportEverywhere: true,
            sourceType: 'module'
        },
        rules: {
            'no-console': 2,
            'no-debugger': 2,
            'no-alert': 2,
            'no-unused-vars': 2,
            'no-undef': 2
        },
        // configFile: false,
        cache: false,
        emitError: 'error',
        failOnError: true,
        eslintPath: require.resolve('eslint'),
        formatter: require('eslint/lib/formatters/codeframe')
    }
);
