/**
 * @file base plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');

const resolve = require('resolve');
const {transformer, formatter, resolveLocal, getLoaderOptions} = require('../utils');

module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = api.getMode() === 'production';
        // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
        const isLegacyBundle = options.modernMode && !options.modernBuild;

        const context = api.getCwd();
        // set mode
        webpackConfig.mode(isProd ? 'production' : 'development').context(api.service.context);
        // set output
        webpackConfig.output
            .path(api.resolve(options.outputDir))
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
                .set('@', api.resolve('src'));
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
        setLoader('img', /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/, 'url', {
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
                .include.add(api.resolve('src'))
            .end()
                .exclude
                    .add(/node_modules/)
                    .add(/@baidu\/hulk-serve/)
                    .add(/@baidu\/hulk-command-component/)
            .end()
        /* eslint-enable*/
        setLoader('js', /\.m?js$/, 'babel');

        // 增加 md loader
        // 来自hulk.config.js component
        const {template, ignore} = options.component || {};
        webpackConfig.module
            .rule('md')
            .test(/\.md$/)
            .use('san-loader')
            .loader(require.resolve('@baidu/hulk-san-loader'))
            .options({
                hotReload: true,
                sourceMap: true,
                minimize: false
            })
            .end()
            .use('markdown')
            .loader(require.resolve('@baidu/hulk-markdown-loader'))
            .options({context, template, ignore});

        // ----------------------pulgins---------------------
        // 大小写敏感！！！！
        webpackConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));
        // 清理
        webpackConfig.plugin('clean-webpack-plugin').use(require('clean-webpack-plugin'), [
            {
                verbose: false
            }
        ]);

        webpackConfig.plugin('friendly-errors').use(require('friendly-errors-webpack-plugin'), [
            {
                additionalTransformers: [transformer],
                additionalFormatters: [formatter]
            }
        ]);
    });
};
