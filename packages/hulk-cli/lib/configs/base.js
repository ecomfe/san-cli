/**
 * @file base plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');

const resolve = require('resolve');
const {resolveLocal, getLoaderOptions} = require('../utils');

module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = api.isProd();
        const args = options._args || {};
        // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
        const isLegacyBundle = args.modernMode && !args.modernBuild;

        // set mode
        webpackConfig.mode(isProd ? 'production' : 'development').context(api.service.context);
        // set output
        webpackConfig.output
            .path(api.resolve(options.outputDir))
            .jsonpFunction('Hulk')
            .filename((isLegacyBundle ? '[name]-legacy' : '[name]') + `${isProd ? '.[hash:8]' : ''}.js`)
            .publicPath(options.baseUrl);

        // prettier-ignore
        /* eslint-disable*/
        webpackConfig
            .resolve
                .set('symlinks', false)
                .extensions.merge(['.js', '.css', '.less', '.san'])
                .end()
            .modules
                .add('node_modules')
                .add(api.resolve('node_modules'))
                .add(resolveLocal('node_modules'))
                .end()
            .alias
                .set('@', api.resolve('src'))
                .set('core-js', path.dirname(require.resolve('core-js')))
                .set('regenerator-runtime', path.dirname(require.resolve('regenerator-runtime')));
        /* eslint-enable*/

        // set san alias
        try {
            const sanFile = resolve.sync('san', {basedir: api.getCwd()});
            const sanPath = path.dirname(sanFile);
            webpackConfig.resolve.alias.set('san', `${sanPath}/${!isProd ? 'san.spa.dev.js' : 'san.spa.js'}`);
        } catch (e) {
            const sanPath = path.dirname(require.resolve('san'));
            webpackConfig.resolve.alias.set('san', `${sanPath}/${!isProd ? 'san.spa.dev.js' : 'san.spa.js'}`);
        }
        // set resolveLoader
        webpackConfig.resolveLoader.modules
            .add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'));

        // ------------------------loaders------------
        const loaderOptions = getLoaderOptions(api, options);
        function setLoader(lang, test, loaders, opts = loaderOptions) {
            const baseRule = webpackConfig.module.rule(lang).test(test);
            if (!Array.isArray(loaders)) {
                loaders = [loaders];
            }
            loaders.forEach(loaderName => {
                const {loader, options, name} = require(`./loaders/${loaderName}`)(opts);
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
            dir: 'svg',
            ...loaderOptions
        });
        setLoader('img', /\.(png|jpe?g|gif|webp)(\?.*)?$/, 'url', {
            dir: 'img',
            ...loaderOptions
        });

        setLoader('media', /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, 'url', {
            dir: 'media',
            ...loaderOptions
        });
        setLoader('fonts', /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, 'url', {
            dir: 'fonts',
            ...loaderOptions
        });

        // js file
        // prettier-ignore
        /* eslint-disable*/
        webpackConfig.module
            .rule('js')
                .test(/\.m?js$/)
                .include
                    .clear()
                    .end()
                .exclude
                    .add(/node_modules\/(?!@baidu)/) // 排除@baidu/xbox这类库
                    .add(/@baidu\/hulk-cli/)
                .end()
        /* eslint-enable*/
        setLoader('js', /\.m?js$/, 'babel');

        // ----------------------pulgins---------------------
        // 大小写敏感！！！！
        webpackConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));
        // 添加progress
        if (args.progress) {
            webpackConfig.plugin('progress').use(require('webpack/lib/ProgressPlugin'));
        }
    });
};
