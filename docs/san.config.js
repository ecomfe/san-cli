/* global __isProduction */
module.exports = {
    publicPath: __isProduction ? 'https://ecomfe.github.io/san-cli/' : '/',
    devServer: {
        contentBase: __dirname
    },
    splitChunks: {
        cacheGroups: {
            default: false,
            // 三方库模块独立打包
            vendors: {
                name: 'vendors',
                test(mod) {
                    return /[\\/](node_modules)[\\/]/.test(mod.resource) && mod.type === 'javascript/auto';
                },
                priority: 20,
                chunks: 'initial'
            }
        }
    },
    css: {
        cssPreprocessor: 'less'
    },
    loaderOptions: {
        markdown: {
            markdownIt: {
                lineNumbers: false
            }
        }
    },
    filenameHashing: __isProduction
};
