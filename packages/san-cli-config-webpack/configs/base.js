const fs = require('fs');
const path = require('path');
const resolveSync = require('resolve').sync;
const defaultsDeep = require('lodash.defaultsdeep');
const rules = require('../rules');
const {getAssetPath} = require('san-cli-utils/path');
const {defineVar} = require('../utils');

module.exports = (webpackChainConfig, projectOptions) => {
    const {
        loaderOptions = {},
        resolve,
        resolveLocal,
        isProduction,
        isLegacyBundle,
        context,
        filenameHashing,
        assetsDir,
        largeAssetSize = 1024
    } = projectOptions;
    webpackChainConfig.context(context);

    // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
    // set output
    // prettier-ignore
    webpackChainConfig.output
        .path(resolve(projectOptions.outputDir))
        /* eslint-disable max-len */
        .filename((isLegacyBundle() ? '[name]-legacy' : '[name]') + `${filenameHashing ? '.[contenthash:8]' : ''}.js`)
        /* eslint-enable max-len */
        .publicPath(projectOptions.publicPath);

    // prettier-ignore
    /* eslint-disable*/
    webpackChainConfig
        .resolve
            .set('symlinks', false)
            // 默认加上 less 吧，less 内部用的最多
            .extensions.merge(['.js', '.css', '.less', '.san'])
            .end()
        .modules
            .add('node_modules')
            .add(resolve('node_modules'))
            .add(resolveLocal('node_modules'))
            .end()
        // set alias
        // TODO: 这里要拿到跟babel配置一起设置
        .alias
            .set('core-js', path.dirname(resolveSync('core-js')))
            .set('regenerator-runtime', path.dirname(resolveSync('regenerator-runtime')));
    /* eslint-enable */

    if (fs.existsSync(resolve('src'))) {
        webpackChainConfig.resolve.alias
            // 加个@默认值
            .set('@', resolve('src'));
    }

    // set resolveLoader
    const resolveLoader = webpackChainConfig.resolveLoader.modules
        .add('node_modules')
        .add(resolve('node_modules'))
        .add(resolveLocal('node_modules'));

    //  优先考虑本地安装的html-loader版本，没有的话去全局路径寻找
    try {
        resolveSync('html-loader', {basedir: context});
        // console.log(`Find local htmlLoader at [${htmlLoader}]`);
    } catch (e) {
        // 找到html-loader所在根目录
        let nodeModulesPath = path.dirname(require.resolve('html-loader'));
        nodeModulesPath = nodeModulesPath.substring(0, nodeModulesPath.lastIndexOf('node_modules')) + 'node_modules';
        resolveLoader.add(nodeModulesPath);
    }
    // set san alias
    try {
        const sanFile = resolveSync('san', {basedir: context});
        const sanPath = path.dirname(sanFile);
        webpackChainConfig.resolve.alias.set(
            'san',
            path.join(sanPath, !isProduction() ? 'san.spa.dev.js' : 'san.spa.js')
        );
    } catch (e) {
        const sanPath = path.dirname(require.resolve('san'));
        webpackChainConfig.resolve.alias.set(
            'san',
            path.join(sanPath, !isProduction() ? 'san.spa.dev.js' : 'san.spa.js')
        );
    }
    // projectOptions.alias
    if (projectOptions.alias) {
        let alias = projectOptions.alias;
        Object.keys(alias).forEach(k => {
            let p = path.isAbsolute(alias[k]) ? alias[k] : resolve(alias[k]);
            webpackChainConfig.resolve.alias.set(k, p);
        });
    }

    // set loaders
    // ------------------------loaders------------
    if (loaderOptions.san !== false) {
        const sanLoaders = [['san', loaderOptions.san]];
        if (!isProduction() && loaderOptions['san-hot'] !== false) {
            sanLoaders.unshift(['san-hot', loaderOptions['san-hot']]);
        }
        rules.createRule(webpackChainConfig, 'san', /\.san$/, sanLoaders);
    }

    // html, ejs
    [
        ['html', /\.html?$/],
        ['ejs', /\.ejs$/]
    ].forEach(([name, test]) => {
        if (loaderOptions[name] !== false) {
            rules.createRule(webpackChainConfig, name, test, [[name, loaderOptions[name]]]);
        }
    });
    // 使用url-loader 设置 img, media, fonts + svg-url设置svg
    [
        ['fonts', /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, 'url'],
        ['media', /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, 'url'],
        ['image', /\.(png|jpe?g|gif|webp)(\?.*)?$/, 'url'],
        ['svg', /\.svg(\?.*)?$/, 'svg']
    ].forEach(([name, test, loader]) => {
        if (loaderOptions[name] !== false) {
            rules[loader](
                webpackChainConfig,
                name,
                test,
                // prettier-ignore
                typeof loaderOptions[name] === 'object'
                    ? defaultsDeep(
                        {
                            limit: largeAssetSize,
                            name: getAssetPath(
                                assetsDir,
                                `${name}/[name]${filenameHashing ? '.[contenthash:8]' : ''}.[ext]`
                            )
                        },
                        loaderOptions[name]
                    )
                    : undefined
            );
        }
    });

    // -----------plugins--------
    webpackChainConfig.plugin('san').use(require('san-loader/lib/plugin'));
    // 大小写敏感！！！！
    webpackChainConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));

    // 定义 env 中的变量
    // 这里需要写到文档，以 SAN_VAR 开头的 env 变量
    webpackChainConfig.plugin('define').use(require('webpack/lib/DefinePlugin'), [defineVar(projectOptions)]);

};
