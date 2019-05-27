/**
 * @file bable loader config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const sanHmrPlugin = require('babel-plugin-san-hmr');
module.exports = ({browserslist, modernMode, modernBuild, command, loaderOptions: {babel = {}}}) => {
    const plugins = (babel && babel.plugins) || [];
    let targets = browserslist;
    // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
    const isModernBundle = modernMode && modernBuild;

    if (isModernBundle) {
        // 这个是 modern 打包
        targets = {esmodules: true};
    }
    if ((command === 'serve' || command === 'component') && !plugins.includes(sanHmrPlugin)) {
        // 添加 san-hmr 插件
        plugins.push(sanHmrPlugin);
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
                        // corejs: false, // 默认值，可以不写
                        regenerator: false, // 通过 preset-env 已经使用了全局的 regeneratorRuntime, 不再需要 transform-runtime 提供的 不污染全局的 regeneratorRuntime
                        helpers: true, // 默认，可以不写
                        useESModules: false, // 不使用 es modules helpers, 减少 commonJS 语法代码
                        absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json'))
                    }
                ],
                ...plugins
            ]
        }
    };
};
