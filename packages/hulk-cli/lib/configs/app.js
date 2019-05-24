/**
 * @file app
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');
const path = require('path');

module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = api.isProd();
        const outputDir = api.resolve(options.outputDir);
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
                } else {
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
            Object.assign(htmlOptions, {
                minify: {
                    removeComments: true,
                    collapseWhitespace: false,
                    removeAttributeQuotes: true,
                    collapseBooleanAttributes: true,
                    removeScriptTypeAttributes: false
                    // more options:
                    // https://github.com/kangax/html-minifier#options-quick-reference
                }
            });
        }

        // resolve HTML file(s)
        const multiPageConfig = options.pages;
        const HTMLPlugin = require('html-webpack-plugin');
        const HulkHtmlPlugin = require('../webpack/HtmlPlugin');
        const htmlPath = api.resolve('public/index.html');
        // 默认路径
        const defaultHtmlPath = path.resolve(
            __dirname,
            options.command === 'component'
                ? '../../template/webpack/component/index.html'
                : '../../template/webpack/index-default.html'
        );
        const publicCopyIgnore = ['index.html', '.DS_Store'];
        let useHtmlPlugin = false;
        if (!multiPageConfig || options.command === 'component') {
            webpackConfig
                .entry('app')
                .add(require.resolve('../../template/webpack/main.js'))
                .end();

            // default, single page setup.
            htmlOptions.alwaysWriteToDisk = true;
            htmlOptions.inject = true;
            htmlOptions.template = fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath;
            webpackConfig.plugin('html').use(HTMLPlugin, [htmlOptions]);
            useHtmlPlugin = true;
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
                let {
                    title,
                    entry,
                    template = `public/${name}.html`,
                    filename,
                    chunks = ['common', 'vendors', 'css-common', name]
                } = normalizePageConfig(multiPageConfig[name]);
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
                const pageHtmlOptions = Object.assign(
                    {
                        alwaysWriteToDisk: true
                    },
                    htmlOptions,
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
                webpackConfig.plugin(`hulk-html-${name}`).use(HulkHtmlPlugin);
            });
            useHtmlPlugin = true;
        }
        if (useHtmlPlugin) {
            // 这里插件是依赖 html-webpack-plguin 的，所以不配置 hwp，会报错哦~
            // html-webpack-harddisk-plugin
            webpackConfig.plugin('html-webpack-harddisk-plugin').use(require('html-webpack-harddisk-plugin'));
        }

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
        if (options.copy && options.command !== 'component') {
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
