/**
 * @file AddonConfig webpack配置导出给外部插件使用
 * @author zttonly
*/

const isProduction = process.env.NODE_ENV === 'production';
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

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
            extract: false
        },
        pages: {
            index: {
                entry: './src/index.js',
                filename: 'index.html',
                title: 'san ui addon'
            }
        },
        chainWebpack: config => {
            config.plugin('clean-webpack-plugin').use(CleanWebpackPlugin);
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
