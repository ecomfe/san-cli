/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file cli-plugin-babel
 */
const path = require('path');
// 根据 config.transpileDependencies 生成babel 处理的正则
// 这里是在 node_modules 中的模块如果是 es6 的，那么可以用这个方式让 babel 处理
// 有利于 Tree-Shaking
function genTranspileDepRegex(transpileDependencies) {
    const deps = transpileDependencies.map(dep => {
        if (typeof dep === 'string') {
            const depPath = path.join('node_modules', dep, '/');
            return process.platform === 'win32'
                ? depPath.replace(/\\/g, '\\\\') // double escape for windows style path
                : depPath;
        }
        else if (dep instanceof RegExp) {
            return dep.source;
        }
    });
    return deps.length ? new RegExp(deps.join('|')) : null;
}

module.exports = {
    id: 'san-cli-plugin-babel',
    apply(api, projectOptions = {}) {
        const cliPath = path.dirname(path.resolve(__dirname, './package.json'));
        const {loaderOptions = {}, transpileDependencies = [], cache, mode} = projectOptions;
        // esbuild实验配置项
        if (mode === 'development' && loaderOptions.esbuild) {
            return;
        }
        // 如果需要 babel 转义node_module 中的模块，则使用这个配置
        // 类似 xbox 这些基础库都提供 esm 版本
        const transpileDepRegex = genTranspileDepRegex(transpileDependencies);
        api.chainWebpack(webpackConfig => {
            webpackConfig.resolveLoader.modules.prepend(path.join(cliPath, 'node_modules'));
            const jsRule = webpackConfig.module
                .rule('js')
                .test(/\.m?js?$/)
                .exclude.add(filepath => {
                    // 兼容webpack 5下data URI，filepath不存在的问题
                    if (!filepath) {
                        return true;
                    }

                    // 包含 .san 的路径
                    if (/\.san$/.test(filepath)) {
                        return false;
                    }

                    // 单独排除 san-cli 路径
                    if (filepath.startsWith(cliPath)) {
                        return true;
                    }

                    // 不排除白名单
                    if (transpileDepRegex && transpileDepRegex.test(filepath)) {
                        return false;
                    }

                    // 默认不编译 node_modules，如果要编译使用排除
                    return /node_modules/.test(filepath);
                })
                .end();
            // 开销大,无必要不开启，仅生产环境开启
            if (loaderOptions.thread && mode !== 'development') {
                jsRule
                    .use('thread-loader')
                    .loader('thread-loader')
                    .options(typeof loaderOptions.thread === 'object' ? loaderOptions.thread : {});
            }
            jsRule
                .use('babel-loader')
                .loader('babel-loader')
                .options(loaderOptions.babel !== false ? {
                    presets: [
                        [require.resolve('./preset'), loaderOptions.babel || {}]
                    ],
                    // 开启babel缓存, 开发环境第二次构建时会读取之前的缓存，与外层cache保持一致
                    cacheDirectory: !!cache
                } : {})
                .end();
        });
    }
};
