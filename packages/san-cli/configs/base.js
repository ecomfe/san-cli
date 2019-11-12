/**
 * @file base webpack config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const resolve = require('resolve');
const {resolveLocal} = require('../lib/utils');
const defaultsDeep = require('lodash.defaultsdeep');

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
            webpackConfig.output
                .path(api.resolve(projectOptions.outputDir))
                // 留个小彩蛋吧~
                .jsonpFunction(projectOptions.jsonpFunction || 'HK3')
                .filename((isLegacyBundle ? '[name]-legacy' : '[name]') + `${isProd ? '.[hash:8]' : ''}.js`)
                .publicPath(projectOptions.publicPath);

            if (!isProd) {
                // dev mode
                webpackConfig.devtool('cheap-module-eval-source-map');
                webpackConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));
                webpackConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
            }

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
                    .set('@', api.resolve('src'))
                    .set('core-js', path.dirname(require.resolve('core-js')))
                    .set('regenerator-runtime', path.dirname(require.resolve('regenerator-runtime')));

            // prettier-ignore
            // set resolveLoader
            webpackConfig
                .resolveLoader
                .modules
                    .add('node_modules')
                    .add(api.resolve('node_modules'))
                    .add(resolveLocal('node_modules'));
            /* eslint-enable */

            // set san alias
            try {
                const sanFile = resolve.sync('san', {basedir: api.getCwd()});
                const sanPath = path.dirname(sanFile);
                webpackConfig.resolve.alias.set('san', `${sanPath}/${!isProd ? 'san.spa.dev.js' : 'san.spa.js'}`);
            } catch (e) {
                const sanPath = path.dirname(require.resolve('san'));
                webpackConfig.resolve.alias.set('san', `${sanPath}/${!isProd ? 'san.spa.dev.js' : 'san.spa.js'}`);
            }
            // set resolver
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

            // san file loader
            setLoader('san', /\.san$/, ['babel', 'san']);
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
            // 大小写敏感！！！！
            webpackConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));
        });
    }
};
