/**
 * @file bable loader config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable fecs-camelcase */
const path = require('path');
const sanHmrPlugin = require('babel-plugin-san-hmr');

module.exports = (context, options = {}) => {
    // TODO: 需要加强 polyfill 逻辑，目前完全是 usage+core-js 玩法
    let {
        useBuiltIns = 'usage',
        debug = false,
        loose = false,
        modules = false,
        corejs = 3,
        ignoreBrowserslistConfig,
        // 这个是plugins数组
        plugins = [],
        targets
    } = options;
    if (process.env.SAN_DEBUG) {
        debug = true;
    }

    const isProd = process.env.NODE_ENV === 'production';

    const isModernBundle = process.env.SAN_CLI_MODERN_BUILD;

    if (isModernBundle) {
        // 这个是 modern 打包
        targets = {esmodules: true};
    }
    if (!isProd && !plugins.includes(sanHmrPlugin)) {
        // 添加 san-hmr 插件
        plugins.push(sanHmrPlugin);
    }

    return {
        presets: [
            [
                require('@babel/preset-env'),
                {
                    debug,
                    loose,
                    ignoreBrowserslistConfig,
                    useBuiltIns,
                    corejs,
                    targets,
                    modules
                }
            ]
        ],
        plugins: [
            ...plugins,
            require('@babel/plugin-syntax-dynamic-import'),
            require('@babel/plugin-syntax-import-meta'),
            [require('@babel/plugin-proposal-class-properties'), {loose}],
            require('@babel/plugin-transform-new-target'),
            require('@babel/plugin-transform-modules-commonjs'),
            [
                require('@babel/plugin-transform-runtime'),
                {
                    corejs: false, // 默认值，可以不写
                    // 通过 preset-env 已经使用了全局的 regeneratorRuntime,
                    // 不再需要 transform-runtime 提供的 不污染全局的 regeneratorRuntime
                    regenerator: useBuiltIns !== 'usage',
                    helpers: useBuiltIns === 'usage', // 默认true
                    useESModules: false, // 不使用 es modules helpers, 减少 commonJS 语法代码
                    absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json'))
                }
            ]
        ]
    };
};
