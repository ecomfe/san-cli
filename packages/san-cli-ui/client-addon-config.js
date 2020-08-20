/**
 * @file clientAddonConfig webpack配置导出给外部插件使用
 * @author zttonly
*/

const isProduction = process.env.NODE_ENV === 'production';

module.exports = function ({id, port = 8889}) {
    return {
        publicPath: isProduction
            ? `/_addon/${id}`
            : `http://localhost:${port}/`,
        assetsDir: '',
        outputDir: 'dist',
        // 文件名是否 hash
        filenameHashing: false,
        // 默认node_modules的依赖是不过 babel 的
        // 如果依赖是 ESM 版本，要过 babel，请开启这里
        // transpileDependencies:['@baidu/nano'],
        css: {
            sourceMap: isProduction,
            cssPreprocessor: 'less',
            extract: false
        },
        pages: {
            index: {
                entry: './src/index.js',
                filename: 'index.html',
                title: 'san ui addon'
                // chunks: ['index', 'vendors']
            }
        },
        chainWebpack: config => {

            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            // config.plugins.delete('optimize-css');

            config.optimization.splitChunks({
                cacheGroups: {
                    // 三方库模块独立打包
                    vendors: {
                        name: 'vendors',
                        test: /[\\/]node_modules\/santd[\\/]/,
                        priority: -10,
                        chunks: 'initial'
                    },
                    default: false
                }
            });
            config.module
                .rule('gql')
                .test(/\.(gql|graphql)$/)
                .use('gql-loader')
                .loader(require.resolve('graphql-tag/loader'))
                .end();
        },
        devServer: {
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            port
        },
        sourceMap: isProduction
    };
};
