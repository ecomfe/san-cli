/**
 * @file plugin optimization
 * @author
 */

const lMerge = require('lodash.merge');
const TerserPlugin = require('terser-webpack-plugin');
const {terserOptions: defaultTerserOptions} = require('../defaultOptions');

module.exports = {
    id: 'optimization',
    schema: joi => ({
        // 生产环境优化相关
        terserOptions: joi.object(),
        sourceMap: joi.alternatives().try(joi.boolean(), joi.string()),
        filenameHashing: joi.boolean(),
        largeAssetSize: joi.number()
    }),
    apply(api, projectOptions = {}, options) {
        const {
            loaderOptions = {},
            terserOptions = {}
        } = projectOptions;
        api.chainWebpack(chainConfig => {
            if (api.isProd()) {
                if (loaderOptions.esbuild) {
                    const {ESBuildMinifyPlugin} = require('esbuild-loader');
                    chainConfig.optimization.minimizer('js').use(new ESBuildMinifyPlugin({
                        minify: true,
                        // minify的默认target设置为es2015，其他值: https://github.com/privatenumber/esbuild-loader
                        target: 'es2015',
                        ...(typeof loaderOptions.esbuild === 'object' ? loaderOptions.esbuild : {})
                    }));
                }
                else {
                    chainConfig.optimization.minimizer('js').use(
                        new TerserPlugin({
                            extractComments: false,
                            parallel: true,
                            terserOptions: lMerge(defaultTerserOptions, terserOptions)
                        })
                    );
                }
            }
        });
    }
};
