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


            //  优先考虑本地安装的html-loader版本，没有的话去全局路径寻找
            try {
                const htmlLoader = resolve.sync('html-loader', {basedir: api.getCwd()});
                // console.log(`Find local htmlLoader at [${htmlLoader}]`);
            } catch (e) {
                // 找到html-loader所在根目录
                let nodeModulesPath = path.dirname(require.resolve('html-loader'));
                nodeModulesPath =
                    nodeModulesPath.substring(0, nodeModulesPath.lastIndexOf('node_modules')) + 'node_modules';
                resolveLoader.add(nodeModulesPath);
            }

            /* eslint-enable */

            // set san alias
            try {
                const sanFile = resolve.sync('san', {basedir: api.getCwd()});
                const sanPath = path.dirname(sanFile);
                webpackConfig.resolve.alias.set('san', path.join(sanPath, !isProd ? 'san.spa.dev.js' : 'san.spa.js'));
            } catch (e) {
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
            } else {
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
        });
    }
};
