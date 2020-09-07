/**
 * @file clientAddonConfig webpack配置导出给外部插件使用
 * @author zttonly
*/

const isProduction = process.env.NODE_ENV === 'production';

module.exports = function ({id, port = 8889}) {
    return {
        publicPath: isProduction ? `/_addon/${id}` : `http://localhost:${port}/`,
        // TODO: 静态资源路径问题
        assetsDir: '',
        outputDir: 'dist',
        // 文件名是否 hash
        filenameHashing: false,
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
            }
        },
        chainWebpack: config => {
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
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
