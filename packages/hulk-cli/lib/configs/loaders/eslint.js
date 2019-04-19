/**
 * @file eslint
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// "eslint": "^5.16.0",
// "babel-eslint": "^10.0.1",
// "eslint-loader": "^2.1.2",
module.exports = ({loaderOptions: {eslint = {}}}) => {
    return {
        name: 'eslint',
        loader: require.resolve('eslint-loader'),
        options: Object.assign(
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
            },
            eslint
        )
    };
};
