/**
 * @file base
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const resolve = require('resolve');

const {transformer, formatter} = require('@baidu/hulk-utils');

module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const {getAssetPath, resolveLocal} = require('../lib/utils');
        const inlineLimit = 4096;
        const isProd = options.mode === 'production';
        const genAssetSubPath = dir => {
            return getAssetPath(options, `${dir}/[name]${options.filenameHashing ? '.[chunkhash:8]' : ''}.[ext]`);
        };

        const genUrlLoaderOptions = dir => {
            return {
                limit: inlineLimit,
                name: genAssetSubPath(dir)
            };
        };

        webpackConfig
            .mode(isProd ? 'production' : 'development')
            .context(api.service.context)
            .entry('app')
            .add('./src/main.js')
            .end()
            .output.path(api.resolve(options.outputDir))
            .filename(`[name]${options.filenameHashing ? '.[hash:8]' : ''}.js`)
            .publicPath(options.baseUrl);

        webpackConfig.resolve
            .set('symlinks', false)
            .extensions.merge(['.js', '.css', '.less', '.scss', '.styl', '.san', '.jsx', '.vue'])
            .end()
            .modules.add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'))
            .end()
            .alias.set('@', api.resolve('src'));

        try {
            resolve.sync('san', {basedir: api.getCwd()});
        } catch (e) {
            const sanPath = path.dirname(require.resolve('san'));
            webpackConfig.resolve.alias.set('san', `${sanPath}/${options.compiler ? 'san.dev.js' : 'san.min.js'}`);
        }

        webpackConfig.resolveLoader.modules
            .add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'));
        // ejs
        webpackConfig.module
            .rule('ejs')
            .test(/\.ejs$/)
            .use('ejs-loader')
            .loader(require.resolve('ejs-loader'));

        // html
        webpackConfig.module
            .rule('html')
            .test(/\.htm[l]$/)
            .use('html-loader')
            .loader(require.resolve('html-loader'))
            .options({attrs: [':data-src']});

        webpackConfig.module
            .rule('san')
            .test(/\.san$/)
            .use('babel-loader')
            .loader(require.resolve('babel-loader'))
            .options({cacheDirectory: true})
            .end()
            .use('hulk-san-loader')
            .loader(require.resolve('@baidu/hulk-san-loader'))
            .options({
                hotReload: !isProd,
                sourceMap: !isProd,
                minimize: isProd
            });

        // hulk buildin css loader
        webpackConfig.module
            .rule('hulk-css')
            .test(/@baidu\/hulk.+\.css$/)
            .use('style-loader')
            .loader(require.resolve('style-loader'))
            .end()
            .use('css-loader')
            .loader(require.resolve('css-loader'));

        webpackConfig.module
            .rule('hulk-less')
            .test(/@baidu\/hulk.+\.less$/)
            .use('style-loader')
            .loader(require.resolve('style-loader'))
            .end()
            .use('css-loader')
            .loader(require.resolve('css-loader'))
            .end()
            .use('less-loader')
            .loader(require.resolve('less-loader'));

        // static assets -----------------------------------------------------------
        webpackConfig.module
            .rule('images')
            .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options(genUrlLoaderOptions('img'));

        // do not base64-inline SVGs.
        // https://github.com/facebookincubator/create-react-app/pull/1180
        webpackConfig.module
            .rule('svg')
            .test(/\.(svg)(\?.*)?$/)
            .use('file-loader')
            .loader(require.resolve('file-loader'))
            .options({
                name: genAssetSubPath('img')
            });

        webpackConfig.module
            .rule('media')
            .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options(genUrlLoaderOptions('media'));

        webpackConfig.module
            .rule('fonts')
            .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options(genUrlLoaderOptions('fonts'));

        // 大小写敏感！！！！
        webpackConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));
        // 清理
        webpackConfig.plugin('clean-webpack-plugin').use(require('clean-webpack-plugin'), [
            {
                verbose: false
            }
        ]);

        if (options.smarty && typeof options.smarty === 'object') {
            const {tplSourcePath, tplTargetPath} = options.smarty;
            webpackConfig.plugin('copy-webpack-plugin').use(require('copy-webpack-plugin'), [
                {
                    from: tplSourcePath,
                    to: tplTargetPath,
                    ignore: ['.*']
                }
            ]);
        }

        // friendly error plugin displays very confusing errors when webpack
        // fails to resolve a loader, so we provide custom handlers to improve it
        webpackConfig.plugin('friendly-errors').use(require('friendly-errors-webpack-plugin'), [
            {
                additionalTransformers: [transformer],
                additionalFormatters: [formatter]
            }
        ]);
    });
};
