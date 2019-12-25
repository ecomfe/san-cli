module.exports = {
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
                    return /[\\/](node_modules|packages)[\\/]/.test(mod.resource) && mod.type === 'javascript/auto';
                },
                priority: 20,
                chunks: 'initial'
            }
        }
    },
    filenameHashing: __isProduction
};
