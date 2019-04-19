/**
 * @file app
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin-for-split');
const hwpTemp = new HtmlWebpackPlugin({});

module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = api.isProd();
        const outputDir = api.resolve(options.outputDir);
        // 1. 判断 pages
        // 2. build 做的事情是判断 serve 对象
        const htmlOptions = {
            templateParameters: (compilation, assets, pluginOptions) => {
                // enhance html-webpack-plugin's built in template params
                let stats;
                return Object.assign({
                    // make stats lazy as it is expensive
                    get webpack() {
                        return stats || (stats = compilation.getStats().toJson());
                    },
                    compilation: compilation,
                    webpackConfig: compilation.options,
                    htmlWebpackPlugin: {
                        files: assets,
                        options: pluginOptions
                    }
                });
            }
        };

        if (isProd) {
            // 压缩 html
            Object.assign(htmlOptions, {
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    collapseBooleanAttributes: true,
                    removeScriptTypeAttributes: true
                    // more options:
                    // https://github.com/kangax/html-minifier#options-quick-reference
                }
            });
        }

        // resolve HTML file(s)
        const multiPageConfig = options.pages;
        const HTMLPlugin = require('html-webpack-plugin');
        const htmlPath = api.resolve('public/index.html');
        // 默认路径
        const defaultHtmlPath = path.resolve(__dirname, '../../template/webpack/index-default.html');
        const publicCopyIgnore = ['index.html', '.DS_Store'];

        if (!multiPageConfig) {
            webpackConfig
                .entry('app')
                .add(require.resolve('../../template/webpack/main.js'))
                .end();
            // default, single page setup.
            htmlOptions.alwaysWriteToDisk = true;
            htmlOptions.inject = true;
            htmlOptions.template = fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath;
            webpackConfig.plugin('html').use(HTMLPlugin, [htmlOptions]);
        } else {
            // multi-page setup
            /**
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
                let {title, entry, template = `public/${name}.html`, filename, chunks} = normalizePageConfig(
                    multiPageConfig[name]
                );
                // inject entry
                webpackConfig.entry(name).add(api.resolve(entry));

                if (!filename) {
                    // 处理 smarty 情况
                    if (path.extname(template) === '.tpl') {
                        filename = path.basename(template);
                    } else {
                        filename = `${name}.html`;
                    }
                }
                filename = path.join(options.templateDir, filename);
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
                const pageHtmlOptions = Object.assign({alwaysWriteToDisk: true}, htmlOptions, {
                    chunks: chunks || ['chunk-vendors', 'chunk-common', name],
                    template: templatePath,
                    // add templateDir
                    filename: ensureRelative(outputDir, filename),
                    title
                });

                webpackConfig.plugin(`html-${name}`).use(HTMLPlugin, [pageHtmlOptions]);
            });
        }

        // html-webpack-harddisk-plugin
        webpackConfig.plugin('html-webpack-harddisk-plugin').use(require('html-webpack-harddisk-plugin'));

        // 处理 smarty 的placeholder
        webpackConfig.plugin('hulk-html-webpack-addons-plugin').use(require('@baidu/hulk-html-webpack-plugin-addons'), [
            {
                alterAssetTags(pluginData) {
                    if (path.extname(pluginData.outputName) === '.tpl') {
                        // 不插入css和js
                        pluginData.head = pluginData.body = [];
                    }

                    return pluginData;
                },
                afterHTMLProcessing(pluginData) {
                    if (!~pluginData.html.indexOf('{%/block%}')) {
                        return pluginData;
                    }
                    // 手动添加资源到项目tpl特定的位置
                    let assetTags = hwpTemp.generateHtmlTags(pluginData.assets);
                    let bodyAsset = assetTags.body.map(hwpTemp.createHtmlTag.bind(hwpTemp));
                    let headAsset = assetTags.head.map(hwpTemp.createHtmlTag.bind(hwpTemp));
                    const headTag = '{%block name="__css_asset"%}';
                    const bodyTag = '{%block name="__script_asset"%}';
                    let html = pluginData.html;
                    // if (isProduction) {
                    //     const reg = new RegExp(config.build.assetsPublicPath, 'g');
                    //     headAsset = headAsset.map(item => item.replace(reg, '{%$staticDomain%}/'));
                    //     bodyAsset = bodyAsset.map(item => item.replace(reg, '{%$staticDomain%}/'));
                    // }
                    // 替换 head body部分
                    [[headAsset, headTag], [bodyAsset, bodyTag]].forEach(([assets, tag]) => {
                        if (~html.indexOf(tag)) {
                            html = html.split(tag).join(`${tag}${assets.join('')}`);
                        } else {
                            html += tag + assets.join('') + '{%/block%}';
                        }
                    });

                    pluginData.html = html;
                    return pluginData;
                }
            }
        ]);
        // copy static assets in public/
        const publicDir = api.resolve('public');
        const copyArgs = [];
        if (options.copyPublicDir && fs.existsSync(publicDir)) {
            copyArgs.push({
                from: publicDir,
                to: outputDir,
                ignore: publicCopyIgnore
            });
        }
        // ------ 这里把 copy 拿到这里来处理是为了合并 ignore
        if (options.copy) {
            const addCopyOptions = ({from, to = './', ignore = []}) => {
                // 排除 templte 的情况
                ignore = publicCopyIgnore.concat(typeof ignore === 'string' ? [ignore] : ignore);
                if (from && !/[$^*?!]+/.test(from) && fs.existsSync(api.resolve(from))) {
                    from = api.resolve(from);
                    // 保证template的相对路径
                    ignore = ignore.map((f, i) => (i > 1 ? ensureRelative(from, api.resolve(f)) : f));
                    copyArgs.push({
                        from,
                        to: path.join(outputDir, to),
                        ignore
                    });
                } else {
                    // 正则的，不处理
                    copyArgs.push({
                        from,
                        to: path.join(outputDir, to),
                        ignore
                    });
                }
            };
            if (Array.isArray(options.copy)) {
                // 数组就循环吧
                options.copy.forEach(addCopyOptions);
            } else {
                addCopyOptions(options.copy);
            }
        }
        if (copyArgs.length) {
            webpackConfig.plugin('copy-webpack-plugin').use(require('copy-webpack-plugin'), [copyArgs]);
        }
        if (options.command === 'serve') {
            webpackConfig.plugin('write-file').use(require('write-file-webpack-plugin'), [{test: /\.tpl$/}]);
        }
    });
};

function ensureRelative(outputDir, p) {
    if (path.isAbsolute(p)) {
        return path.relative(outputDir, p);
    } else {
        return p;
    }
}
