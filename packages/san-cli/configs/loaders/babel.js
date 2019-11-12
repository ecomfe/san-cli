/**
 * @file bable loader config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable fecs-camelcase */
const path = require('path');
const sanHmrPlugin = require('babel-plugin-san-hmr');
const wrapper = require('./loaderWrapper');

module.exports = wrapper((babelOptions = {}, projectOptions, api) => {
    // TODO: 需要加强 polyfill 逻辑，目前完全是 usage+core-js 玩法
    const isProd = api.isProd();
    const plugins = babelOptions.plugins || [];
    const presets = babelOptions.presets || {};

    const {useBuiltIns = 'usage', debug = false, loose = false, modules = false, ignoreBrowserslistConfig} = presets;
    let targets = presets.targets;
    if (!targets && !ignoreBrowserslistConfig) {
        targets = {
            browsers: projectOptions.browserslist || [
                '> 1.2% in cn',
                'last 2 versions',
                'iOS >=8', // 这里有待商榷
                'android>4.4',
                'not bb>0',
                'not ff>0',
                'not ie>0',
                'not ie_mob>0'
            ]
        };
    }

    if (!isProd && !plugins.includes(sanHmrPlugin)) {
        // 添加 san-hmr 插件
        plugins.push(sanHmrPlugin);
    }

    return {
        name: 'babel-loader',
        loader: require.resolve('babel-loader'),
        options: {
            cacheDirectory: !isProd,
            presets: [
                [
                    require('@babel/preset-env'),
                    Object.assign(
                        {
                            debug,
                            loose,
                            ignoreBrowserslistConfig,
                            useBuiltIns,
                            corejs: 3,
                            targets,
                            modules
                        },
                        presets
                    )
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
        }
    };
});
