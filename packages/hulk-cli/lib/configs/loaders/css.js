/**
 * @file css-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({mode = 'development', sourceMap, loaderOptions: {css = {}}}) => {
    return {
        name: 'css-loader',
        loader: require.resolve('css-loader'),
        options: {
            importLoaders: 1,
            sourceMap
        }
    };
};
