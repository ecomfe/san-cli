/**
 * @file
 * @author
 */

const semver = require('semver');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const defaultsDeep = require('lodash.defaultsdeep');
const {findExisting, getAssetPath} = require('san-cli-utils/path');
const {warn} = require('san-cli-utils/ttyLogger');

const {cssnanoOptions: defaultCssnanoOptions} = require('../defaultOptions');
const createCSSRule = require('../rules/createCSSRule');

module.exports = {
    id: 'css',
    schema: joi => ({
        // css 相关
        css: joi.object({
            cssnanoOptions: joi.object(),
            cssPreprocessor: joi.string().valid('less', 'sass', 'stylus'),
            extract: joi.alternatives().try(joi.boolean(), joi.object()),
            sourceMap: joi.boolean(),
            loaderOptions: joi.object({
                style: joi.object(),
                css: joi.object(),
                sass: joi.object(),
                less: joi.object(),
                stylus: joi.object(),
                // 推荐使用 postcss.config.js
                postcss: joi.object()
            })
        }),
    }),
    apply(api, projectOptions = {}, options) {
        const {
            isProduction,
            pkg,
            css: cssOptions = {},
            sourceMap: rootSourceMap,
            resolve,
            publicPath,
            assetsDir,
            filenameHashing,
            loaderOptions: rootLoaderOptions = {}
        } = projectOptions;
        api.chainWebpack(chainConfig => {
            const isProd = isProduction();
            // 这里loaderOptions直接用 projectOptions.css 的内容
            const {
                extract = isProd,
                // 不在 css 中单独配置，默认跟 projectOptions.sourceMap 一致
                sourceMap = !!rootSourceMap,
                cssPreprocessor,
                cssnanoOptions
            } = cssOptions;
            // 实验功能，使用esbuild压缩css时无法产生sourcemap: https://github.com/privatenumber/esbuild-loader
            const esbuild = rootLoaderOptions.esbuild || {};
            // 有则优先使用css中的loaderoptions，否则使用root loaderOptions
            const loaderOptions = cssOptions.loaderOptions
                ? defaultsDeep(cssOptions.loaderOptions, rootLoaderOptions)
                : rootLoaderOptions;

            // css module使用loaderOption下css的配置控制
            loaderOptions.css = loaderOptions.css || {};

            loaderOptions.css.modules = {
                localIdentName: isProd ? '[hash:base64]' : '[name]_[local]_[hash:base64:5]',
                ...loaderOptions.css.modules
            };

            // --------extract css---------
            const shouldExtract = extract !== false;
            const filename = getAssetPath(
                assetsDir,
                `css/[name]${filenameHashing ? '.[contenthash:8]' : ''}.css`
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
            const cssPublicPath = publicPath
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
            const useEsbuild = esbuild.css;
            // 1. 设置style loader
            // 2. 设置 css loader + css module + postcss
            createCSSRule(chainConfig, 'css', /\.css$/, {
                extract: shouldExtract,
                useEsbuild,
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
                createCSSRule(chainConfig, 'scss', /\.scss$/, {
                    preprocessor: cssPreprocessor,
                    loaderOptions,
                    extract: shouldExtract,
                    useEsbuild,
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
                createCSSRule(chainConfig, 'sass', /\.sass$/, {
                    preprocessor: cssPreprocessor,
                    loaderOptions,
                    extract: shouldExtract,
                    useEsbuild,
                    sourceMap
                });
            }
            if (!cssPreprocessor || cssPreprocessor === 'less') {
                require('../rules/less')(chainConfig, 'less', /\.less$/, {
                    preprocessor: cssPreprocessor,
                    loaderOptions,
                    extract: shouldExtract,
                    useEsbuild,
                    sourceMap
                });
            }
            if (!cssPreprocessor || cssPreprocessor === 'stylus') {
                createCSSRule(chainConfig, 'stylus', /\.styl(us)?$/, {
                    preprocessor: cssPreprocessor,
                    loaderOptions,
                    extract: shouldExtract,
                    useEsbuild,
                    sourceMap
                });
            }

            // inject CSS extraction plugin
            if (shouldExtract) {
                chainConfig.plugin('extract-css').use(require('mini-css-extract-plugin'), [extractOptions]);
                // minify extracted CSS
                if (isProd && !useEsbuild) {
                    const nanoOptions = {
                        preset: ['default', Object.assign(defaultCssnanoOptions, cssnanoOptions)]
                    };
                    // 压缩
                    chainConfig.optimization.minimizer('css').use(CssMinimizerPlugin, [
                        {
                            parallel: true,
                            minimizerOptions: nanoOptions
                        }
                    ]);
                }
            }
        });
    }
};
