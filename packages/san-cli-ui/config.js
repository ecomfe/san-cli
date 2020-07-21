/**
 * @file clientAddonConfig webpack配置导出给外部插件使用
 * @author zttonly
*/

const isProduction = process.env.NODE_ENV === 'production';

exports.clientAddonConfig = function ({id, port = 8889}) {
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
            cssPreprocessor: 'less'
        },
        loaderOptions: {
            babel: {
                plugins: [
                    [
                        require.resolve('babel-plugin-import'),
                        {
                            libraryName: 'santd',
                            libraryDirectory: 'es',
                            style: true
                        }
                    ]
                ]
            }
        },
        chainWebpack: config => {
            config.output
                .filename('index.js')
                .chunkFilename('index.js');
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            config.plugins.delete('html');
            config.plugins.delete('optimize-css');

            config.optimization.splitChunks(false);

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
