/**
 * @file bable loader config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
module.exports = ({browserslist, modernMode, modernBuild, command, loaderOptions: {babel = {}}}) => {
    const plugins = (babel && babel.plugins) || [];
    let targets = browserslist;
    // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
    const isModernBundle = modernMode && modernBuild;
    if (isModernBundle) {
        // 这个是 modern 打包
        targets = {esmodules: true};
    }

    return {
        name: 'babel-loader',
        loader: require.resolve('babel-loader'),
        options: {
            cacheDirectory: command !== 'serve',
            presets: [
                [
                    require('@babel/preset-env'),
                    {
                        debug: false,
                        useBuiltIns: 'usage',
                        corejs: 3,
                        targets,
                        modules: false
                    }
                ]
            ],
            plugins: [
                require('@babel/plugin-syntax-dynamic-import'),
                require('@babel/plugin-syntax-import-meta'),
                require('@babel/plugin-proposal-class-properties'),
                require('@babel/plugin-transform-new-target'),
                require('@babel/plugin-transform-modules-commonjs'),
                [
                    require('@babel/plugin-transform-runtime'),
                    {
                        regenerator: false,
                        helpers: true,
                        useESModules: false,
                        absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json'))
                    }
                ],
                ...plugins
            ]
        }
    };
};
