/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file base webpack config
 * @author ksky521
 */

const path = require('path');
const resolve = require('resolve');
const defaultsDeep = require('lodash.defaultsdeep');
const fs = require('fs');
// 相对 service module 的路径
function resolveLocal(...args) {
    return path.join(__dirname, '../', ...args);
}
module.exports = {
    id: 'built-in:base',
    apply(api, projectOptions) {
        api.chainWebpack(webpackConfig => {
            const isProd = api.isProd();
            // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
            const isLegacyBundle = process.env.SAN_CLI_LEGACY_BUILD;
            // set mode
            webpackConfig.mode(isProd ? 'production' : 'development').context(api.service.cwd);
            // set output
            // prettier-ignore
            webpackConfig.output
                .path(api.resolve(projectOptions.outputDir))
                // TODO: to be immigrated to chunkLoadingGlobal
                // TODO: @see https://github.com/webpack/webpack/pull/11385
                // TODO: .jsonpFunction不再支持了，看起来是chainWebpack需要升级
                // 留个小彩蛋吧~
                // .jsonpFunction(projectOptions.jsonpFunction || 'HK3')
                /* eslint-disable max-len */
                .filename((isLegacyBundle ? '[name]-legacy' : '[name]') + `${projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.js`)
                /* eslint-enable max-len */
                .publicPath(projectOptions.publicPath);

            // prettier-ignore
            /* eslint-disable*/
            webpackConfig
                .resolve
                    .set('symlinks', false)
                    // 默认加上 less 吧，less 内部用的最多
                    .extensions.merge(['.js', '.css', '.less', '.san'])
                    .end()
                .modules
                    .add('node_modules')
                    .add(api.resolve('node_modules'))
                    .add(resolveLocal('node_modules'))
                    .end()
                // set alias
                .alias
                    .set('core-js', path.dirname(require.resolve('core-js')))
                    .set('regenerator-runtime', path.dirname(require.resolve('regenerator-runtime')));
            if (fs.existsSync(api.resolve('src'))) {
                webpackConfig.resolve.alias
                    // 加个@默认值
                    .set('@', api.resolve('src'));
            }

            // prettier-ignore
            // set resolveLoader
            const resolveLoader = webpackConfig
                .resolveLoader
                // 添加 pnp-loader
                .modules
                    .add('node_modules')
                    .add(api.resolve('node_modules'))
                    .add(resolveLocal('node_modules'));

            //  优先考虑本地安装的html-loader版本，没有的话去全局路径寻找
            try {
                const htmlLoader = resolve.sync('html-loader', {basedir: api.getCwd()});
                // console.log(`Find local htmlLoader at [${htmlLoader}]`);
            }
            catch (e) {
                // 找到html-loader所在根目录
                let nodeModulesPath = path.dirname(require.resolve('html-loader'));
                nodeModulesPath = nodeModulesPath.substring(0, nodeModulesPath.lastIndexOf('node_modules')) + 'node_modules';
                resolveLoader.add(nodeModulesPath);
            }

            /* eslint-enable */

            // set san alias
            try {
                const sanFile = resolve.sync('san', {basedir: api.getCwd()});
                const sanPath = path.dirname(sanFile);
                webpackConfig.resolve.alias.set('san', path.join(sanPath, !isProd ? 'san.spa.dev.js' : 'san.spa.js'));
            }
            catch (e) {
                const sanPath = path.dirname(require.resolve('san'));
                webpackConfig.resolve.alias.set('san', path.join(sanPath, !isProd ? 'san.spa.dev.js' : 'san.spa.js'));
            }
            // projectOptions.alias
            if (projectOptions.alias) {
                let alias = projectOptions.alias;
                Object.keys(alias).forEach(k => {
                    let p = path.isAbsolute(alias[k]) ? alias[k] : api.resolve(alias[k]);
                    webpackConfig.resolve.alias.set(k, p);
                });
            }

            // set loaders
            // ------------------------loaders------------
            const loaderOptions = projectOptions.loaderOptions || {};
            function setLoader(lang, test, loaders, curLoaderOptions = {}) {
                const baseRule = webpackConfig.module.rule(lang).test(test);
                if (!Array.isArray(loaders)) {
                    loaders = [loaders];
                }
                loaders.forEach(loaderName => {
                    curLoaderOptions = defaultsDeep(curLoaderOptions, loaderOptions[loaderName] || {});
                    const {loader, options, name} = require(`./loaders/${loaderName}`)(
                        curLoaderOptions,
                        projectOptions,
                        api
                    );
                    baseRule
                        .use(name)
                        .loader(loader)
                        .options(options)
                        .end();
                });
            }
            if (!isProd) {
                setLoader('san', /\.san$/, ['hmr', 'san']);
                setLoader('js', /\.m?js?$/, ['hmr']);
            }
            else {
                setLoader('san', /\.san$/, ['san']);
            }
            setLoader('ejs', /\.ejs$/, 'ejs');
            setLoader('html', /\.html?$/, 'html');
            setLoader('svg', /\.svg(\?.*)?$/, 'svg', {
                dir: 'svg'
            });
            setLoader('img', /\.(png|jpe?g|gif|webp)(\?.*)?$/, 'url', {
                dir: 'img'
            });

            setLoader('media', /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, 'url', {
                dir: 'media'
            });
            setLoader('fonts', /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, 'url', {
                dir: 'fonts'
            });
            // ----------------------pulgins---------------------
            webpackConfig.plugin('san').use(require('san-loader/lib/plugin'));
            // 大小写敏感！！！！
            webpackConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));
            // 定义 env 中的变量
            // 这里需要写到文档，以 SAN_VAR 开头的 env 变量
            webpackConfig.plugin('define').use(require('webpack/lib/DefinePlugin'), [defineVar()]);
            if (!isProd) {
                // dev mode
                webpackConfig.devtool('eval-cheap-module-source-map');
                webpackConfig.plugin('hmr')
                    .use(require('webpack/lib/HotModuleReplacementPlugin'));
                webpackConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
            }
            // 将 env 中的值进行赋值
            function defineVar() {
                const vars = {
                    // TODO 这里要不要按照 mode 设置下 undefined 的情况？
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                    PRODUCTION: JSON.stringify(isProd),
                    BASE_URL: JSON.stringify(projectOptions.publicPath)
                };
                // 这里把var 变量名拆出来
                const re = /^SAN_VAR_([\w\d\_]+)$/;
                Object.keys(process.env).forEach(key => {
                    if (re.test(key)) {
                        const name = re.exec(key)[1];
                        vars[name] = JSON.stringify(process.env[key]);
                    }
                });
                return vars;
            }
        });
    }
};
