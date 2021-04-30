/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 主要配置 html-plugin
 * @author ksky521
 */

const path = require('path');
const fs = require('fs');
const minify = require('html-minifier-terser').minify;
const lMerge = require('lodash.merge');
const {terserOptions: defaultTerserOptions, htmlMinifyOptions} = require('../options');
module.exports = {
    id: 'built-in:app',
    apply(api, options) {
        api.chainWebpack(webpackConfig => {
            const isProd = api.isProd();
            const outputDir = api.resolve(options.outputDir);
            const terserOptions = Object.assign(defaultTerserOptions, options.terserOptions);

            // 1. 判断 pages
            // 2. build 做的事情是判断 serve 对象
            const htmlOptions = {
                inject: true,
                templateParameters: (...args) => {
                    /* eslint-disable one-var */
                    let compilation, assets, assetTags, pluginOptions;
                    /* eslint-enable one-var */

                    if (args.length === 4) {
                        // v4 版本
                        [compilation, assets, assetTags, pluginOptions] = args;
                    }
                    else {
                        // v3 版本
                        [compilation, assets, pluginOptions] = args;
                    }
                    // enhance html-webpack-plugin's built in template params
                    let stats;
                    return Object.assign({
                        // make stats lazy as it is expensive
                        get webpack() {
                            return stats || (stats = compilation.getStats().toJson());
                        },
                        compilation,
                        webpackConfig: compilation.options,
                        htmlWebpackPlugin: {
                            files: assets,
                            tags: assetTags,
                            options: pluginOptions
                        }
                    });
                }
            };

            if (isProd) {
                // 压缩 html
                // 跟 terserOptions 打平
                htmlMinifyOptions.minifyJS = terserOptions;
                lMerge(htmlOptions, {
                    minify: htmlMinifyOptions
                });
            }

            // resolve HTML file(s)
            const multiPageConfig = options.pages;
            const HTMLPlugin = require('html-webpack-plugin');
            const SanHtmlPlugin = require('san-cli-webpack/lib/HTMLPlugin');
            const htmlPath = api.resolve('public/index.html');
            // 默认路径
            const defaultHtmlPath = require.resolve('../template/index.html');
            const publicCopyIgnore = ['index.html', '.DS_Store'];
            let useHtmlPlugin = false;
            if (!multiPageConfig) {
                // default, single page setup.
                htmlOptions.alwaysWriteToDisk = true;
                htmlOptions.inject = true;
                htmlOptions.template = fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath;
                webpackConfig.plugin('html').use(HTMLPlugin, [htmlOptions]);
                useHtmlPlugin = true;
            }
            else {
                // multi-page setup
                /** simple
                 * pages: {
                        index: {
                        entry: 'src/entry-point/index/main.js', //entry for the public page
                        template: 'public/index.html', // source template
                        filename: 'index.html' // output as dist/*
                        },
                        signin: {
                        entry: 'src/entry-point/signin/main.js',
                        template: 'public/signin.html',
                        filename: 'signin.html'
                        }
                    }
                 */
                webpackConfig.entryPoints.clear();
                const pages = Object.keys(multiPageConfig);
                const normalizePageConfig = c => (typeof c === 'string' ? {entry: c} : c);

                pages.forEach(name => {
                    let pageConfig = normalizePageConfig(multiPageConfig[name]);
                    let {
                        title,
                        entry,
                        template = `public/${name}.html`,
                        filename,
                        // 这里需要跟 mode 里面的 splitChunks 遥相呼应
                        chunks = [name]
                        // chunks = ['common', 'vendors', 'css-common', name]
                    } = pageConfig;
                    if (Array.isArray(chunks) && chunks.indexOf(name) === -1) {
                        chunks.push(name);
                    }

                    // inject entry
                    const entries = Array.isArray(entry) ? entry : [entry];
                    webpackConfig.entry(name).merge(entries.map(e => api.resolve(e)));

                    if (!filename) {
                        // 处理 smarty 情况
                        if (path.extname(template) === '.tpl') {
                            filename = path.basename(template);
                        }
                        else {
                            filename = `${name}.html`;
                        }
                    }
                    // filename = path.join(options.templateDir, filename);
                    // resolve page index template
                    const hasDedicatedTemplate = fs.existsSync(api.resolve(template));
                    if (hasDedicatedTemplate) {
                        publicCopyIgnore.push(template);
                    }
                    const templatePath = hasDedicatedTemplate
                        ? template
                        : fs.existsSync(htmlPath)
                            ? htmlPath
                            : defaultHtmlPath;

                    // inject html plugin for the page
                    const pageHtmlOptions = Object.assign(
                        {
                            alwaysWriteToDisk: true
                        },
                        htmlOptions,
                        pageConfig,
                        {
                            chunks,
                            entry: name,
                            template: templatePath,
                            // add templateDir
                            filename: ensureRelative(outputDir, filename),
                            title
                        }
                    );
                    webpackConfig.plugin(`html-${name}`).use(HTMLPlugin, [pageHtmlOptions]);
                    webpackConfig.plugin(`san-html-${name}`).use(SanHtmlPlugin);
                });
                useHtmlPlugin = true;
            }
            if (useHtmlPlugin) {
                // 这里插件是依赖 html-webpack-plguin 的，所以不配置 hwp，会报错哦~
                // html-webpack-harddisk-plugin
                webpackConfig
                    .plugin('html-webpack-harddisk-plugin')
                    .use(require('html-webpack-harddisk-plugin'));
            }
            const copyArgs = [];
            // copy static assets in public/
            // 这里不属于 cli 的范畴，所以暂时不加了，让打包脚本自己处理吧
            // const publicDir = api.resolve('public');
            // if (options.copyPublicDir && fs.existsSync(publicDir)) {
            //     copyArgs.push({
            //         from: publicDir,
            //         to: outputDir,
            //         ignore: publicCopyIgnore
            //     });
            // }
            // ------ 这里把 copy 拿到这里来处理是为了合并 ignore
            if (options.copy) {
                const addCopyOptions = options => {
                    let {from, to = './', ignore = [], compress = process.env.NODE_ENV === 'production'} = options;
                    // smarty 的专属
                    const defaultTransformOptions = compress
                        ? {
                            transform: (content, path) => {
                                if (/\.(tpl|html|htm)$/.test(path)) {
                                    return minify(content.toString(), {
                                        minifyCSS: true,
                                        minifyJS: terserOptions,
                                        ignoreCustomFragments: [/{%[\s\S]*?%}/, /<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/]
                                    });
                                }
                                return content;
                            }
                        }
                        : {};

                    // 排除 templte 的情况
                    ignore = publicCopyIgnore.concat(typeof ignore === 'string' ? [ignore] : ignore);
                    if (from && !/[$^*?!]+/.test(from) && fs.existsSync(api.resolve(from))) {
                        from = api.resolve(from);
                        // 保证template的相对路径
                        ignore = ignore.map((f, i) => (i > 1 ? ensureRelative(from, api.resolve(f)) : f));
                        copyArgs.push(
                            Object.assign(defaultTransformOptions, options, {
                                from,
                                to: path.join(outputDir, to),
                                globOptions: {
                                    ignore
                                }
                            })
                        );
                    }
                    else {
                        // 正则的，不处理
                        copyArgs.push(
                            Object.assign(defaultTransformOptions, options, {
                                from,
                                to: path.join(outputDir, to),
                                globOptions: {
                                    ignore
                                }
                            })
                        );
                    }
                };
                if (Array.isArray(options.copy)) {
                    // 数组就循环吧
                    options.copy.forEach(addCopyOptions);
                }
                else {
                    addCopyOptions(options.copy);
                }
            }
            if (copyArgs.length) {
                webpackConfig.plugin('copy-webpack-plugin').use(require('copy-webpack-plugin'), [{patterns: copyArgs}]);
            }
        });
    }
};
function ensureRelative(outputDir, p) {
    if (path.isAbsolute(p)) {
        return path.relative(outputDir, p);
    }
    return p;
}
