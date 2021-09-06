/**
 * @file plugin optimization
 * @author
 */

const lMerge = require('lodash.merge');
const TerserPlugin = require('terser-webpack-plugin');
const {terserOptions: defaultTerserOptions} = require('../defaultOptions');

module.exports = {
    id: 'optimization',
    pickConfig: {
        // 生产环境优化相关
        esbuildOptions: 'loaderOptions.esbuild',
        terserOptions: 'terserOptions'
    },
    apply(api, options = {}) {
        const {
            esbuildOptions,
            terserOptions = {}
        } = options;
        api.chainWebpack(chainConfig => {
            if (api.isProd()) {
                if (esbuildOptions) {
                    const {ESBuildMinifyPlugin} = require('esbuild-loader');
                    chainConfig.optimization.minimizer('js').use(new ESBuildMinifyPlugin({
                        minify: true,
                        // minify的默认target设置为es2015，其他值: https://github.com/privatenumber/esbuild-loader
                        target: 'es2015',
                        ...(typeof esbuildOptions === 'object' ? esbuildOptions : {})
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
