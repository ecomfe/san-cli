const semver = require('semver');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const defaultsDeep = require('lodash.defaultsdeep');
const {findExisting, getAssetPath} = require('san-cli-utils/path');
const {warn} = require('san-cli-utils/ttyLogger');

const {cssnanoOptions: defaultCssnanoOptions} = require('../defaultOptions');
const createCSSRule = require('../rules/createCSSRule');

module.exports = (webpackChainConfig, rootOptions) => {
    const {
        isProduction,
        pkg,
        css: cssOptions = {},
        sourceMap: rootSourceMap,
        resolve,
        loaderOptions: rootLoaderOptions = {}
    } = rootOptions;
    const isProd = isProduction();
    // 这里loaderOptions直接用 rootOptions.css 的内容
    const {
        extract = isProd,
        // 不在 css 中单独配置，默认跟 rootOptions.sourceMap 一致
        sourceMap = !!rootSourceMap,
        cssPreprocessor,
        cssnanoOptions
    } = cssOptions;

    // 有则优先使用css中的loaderoptions，否则使用root loaderOptions
    const loaderOptions = cssOptions.loaderOptions
        ? defaultsDeep(rootLoaderOptions, cssOptions.loaderOptions)
        : rootLoaderOptions;

    // ------css module------
    let requireModuleExtension = cssOptions.requireModuleExtension;
    if (typeof requireModuleExtension === 'undefined') {
        if (loaderOptions.css && loaderOptions.css.modules) {
            throw new Error('`css.requireModuleExtension` is required when custom css modules options provided');
        }
        requireModuleExtension = true;
    }

    // --------extract css---------
    const shouldExtract = extract !== false;
    const filename = getAssetPath(
        rootOptions.assetsDir,
        `css/[name]${rootOptions.filenameHashing ? '.[contenthash:8]' : ''}.css`
    );
    const extractOptions = Object.assign(
        {
            filename,
            chunkFilename: filename
        },
        extract && typeof extract === 'object' ? extract : {}
    );

    // use relative publicPath in extracted CSS based on extract location
    // use config publicPath first
    const cssPublicPath = rootOptions.publicPath
        || '../'.repeat(extractOptions.filename.replace(/^\.[\/\\]/, '').split(/[\/\\]/g).length - 1);

    loaderOptions['extract-css'] = Object.assign(
        {
            // hmr: !isProd,
            publicPath: cssPublicPath
        },
        loaderOptions['extract-css'] || {}
    );

    // -------postcss---------
    const postCSSOptions = loaderOptions.postcss;
    // prettier-ignore
    const hasPostCSSConfig = !!(
        postCSSOptions
        || pkg.postcss
        || findExisting(
            ['.postcssrc', '.postcssrc.js', 'postcss.config.js', '.postcssrc.yaml', '.postcssrc.json'],
            resolve('.')
        )
    );
    if (!hasPostCSSConfig) {
        loaderOptions.postcss = {
            plugins: [require('autoprefixer')]
        };
    }

    // 1. 设置style loader
    // 2. 设置 css loader + css module + postcss
    createCSSRule(webpackChainConfig, 'css', /\.css$/, {
        requireModuleExtension,
        extract: shouldExtract,
        loaderOptions,
        sourceMap: false
    });

    // 3. 根据预处理器 + 2~1
    if (!cssPreprocessor || cssPreprocessor === 'sass') {
        let sassLoaderVersion;
        try {
            sassLoaderVersion = semver.major(require('sass-loader/package.json').version);
        }
        catch (e) {}
        if (sassLoaderVersion < 8) {
            warn('A new version of sass-loader is available. Please upgrade for best experience.');
        }
        // 添加 sass 逻辑
        createCSSRule(webpackChainConfig, 'scss', /\.scss$/, {
            requireModuleExtension,
            preprocessor: cssPreprocessor,
            loaderOptions,
            extract: shouldExtract,
            sourceMap
        });

        if (sassLoaderVersion < 8) {
            loaderOptions.sass = Object.assign(
                {
                    indentedSyntax: true
                },
                loaderOptions.sass || {}
            );
        } else {
            loaderOptions.sass = Object.assign(loaderOptions.sass || {}, {
                sassOptions: Object.assign({}, loaderOptions.sass && loaderOptions.sass.sassOptions, {
                    indentedSyntax: true
                })
            });
        }
        createCSSRule(webpackChainConfig, 'sass', /\.sass$/, {
            requireModuleExtension,
            preprocessor: cssPreprocessor,
            loaderOptions,
            extract: shouldExtract,
            sourceMap
        });
    }
    if (!cssPreprocessor || cssPreprocessor === 'less') {
        require('../rules/less')(webpackChainConfig, 'less', /\.less$/, {
            requireModuleExtension,
            preprocessor: cssPreprocessor,
            loaderOptions,
            extract: shouldExtract,
            sourceMap
        });
    }
    if (!cssPreprocessor || cssPreprocessor === 'stylus') {
        createCSSRule(webpackChainConfig, 'stylus', /\.styl(us)?$/, {
            requireModuleExtension,
            preprocessor: cssPreprocessor,
            loaderOptions,
            extract: shouldExtract,
            sourceMap
        });
    }

    // inject CSS extraction plugin
    if (shouldExtract) {
        webpackChainConfig.plugin('extract-css').use(require('mini-css-extract-plugin'), [extractOptions]);
        // minify extracted CSS
        if (isProd) {
            const nanoOptions = {
                preset: ['default', Object.assign(defaultCssnanoOptions, cssnanoOptions)]
            };
            // 压缩
            const {parallel = true, productionSourceMap = false} = rootOptions;
            webpackChainConfig.optimization.minimizer('css').use(CssMinimizerPlugin, [
                {
                    parallel,
                    sourceMap: productionSourceMap && sourceMap,
                    minimizerOptions: nanoOptions
                }
            ]);
        }
    }
};
