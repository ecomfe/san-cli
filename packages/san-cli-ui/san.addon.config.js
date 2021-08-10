/**
 * @file AddonConfig webpack配置导出给外部插件使用, 增加cssmodule
 * @author zttonly
*/

const isProduction = process.env.NODE_ENV === 'production';

module.exports = function ({id, port = 8889}) {
    return {
        publicPath: isProduction ? `/_addon/${id}` : `http://localhost:${port}/`,
        // TODO: 静态资源路径问题
        assetsDir: '',
        outputDir: 'dist',
        filenameHashing: false,
        css: {
            sourceMap: false,
            cssPreprocessor: 'less',
            extract: false,
            loaderOptions: {
                css: {
                    modules: {
                        auto: () => true,
                        exportLocalsConvention: 'camelCase'
                    }
                }
            }
        },
        cache: false, // 关闭cache，否则调试widget时有样式缓存
        pages: {
            index: {
                entry: './src/index.js',
                filename: 'index.html',
                title: 'san ui addon'
            }
        },
        chainWebpack: config => {
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            config.module.rule('gql')
                .test(/\.(graphql|gql)$/)
                .use('graphql-loader').loader(require.resolve('graphql-tag/loader'));
            config.output.filename('index.js');
            config.optimization.splitChunks({
                maxSize: 1000000000
            });
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
