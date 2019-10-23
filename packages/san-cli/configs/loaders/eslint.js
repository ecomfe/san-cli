/**
 * @file eslint
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const wrapper = require('./loaderWrapper');

module.exports = wrapper(
    options => {
        return {
            name: 'eslint',
            loader: require.resolve('eslint-loader'),
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
