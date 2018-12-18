/**
 * @file base
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {transformer, formatter} = require('@baidu/hulk-utils');
module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const {getAssetPath, resolveLocal} = require('../lib/utils');
        const inlineLimit = 4096;

        const genAssetSubPath = dir => {
            return getAssetPath(options, `${dir}/[name]${options.filenameHashing ? '.[hash:8]' : ''}.[ext]`);
        };

        const genUrlLoaderOptions = dir => {
            return {
                limit: inlineLimit,
                // use explicit fallback to avoid regression in url-loader>=1.1.0
                fallback: {
                    loader: 'file-loader',
                    options: {
                        name: genAssetSubPath(dir)
                    }
                }
            };
        };

        webpackConfig
            .mode('development')
            .context(api.service.context)
            .entry('app')
            .add('./src/main.js')
            .end()
            .output.path(api.resolve(options.outputDir))
            .filename('[name].js')
            .publicPath(options.baseUrl);

        webpackConfig.resolve
            .set('symlinks', false)
            .extensions.merge(['.js', '.san', '.json'])
            .end()
            .modules.add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'))
            .end()
            .alias.set('@', api.resolve('src'))
            .set('san', options.sanDev ? 'san/dist/san.dev.js' : 'san/dist/san.min.js');

        webpackConfig.resolveLoader.modules
            .add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'));

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
                hotReload: true,
                sourceMap: true,
                minimize: false
            });

        // static assets -----------------------------------------------------------

        webpackConfig.module
            .rule('images')
            .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
            .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('img'));

        // do not base64-inline SVGs.
        // https://github.com/facebookincubator/create-react-app/pull/1180
        webpackConfig.module
            .rule('svg')
            .test(/\.(svg)(\?.*)?$/)
            .use('file-loader')
            .loader('file-loader')
            .options({
                name: genAssetSubPath('img')
            });

        webpackConfig.module
            .rule('media')
            .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
            .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('media'));

        webpackConfig.module
            .rule('fonts')
            .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
            .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('fonts'));

        webpackConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));

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
