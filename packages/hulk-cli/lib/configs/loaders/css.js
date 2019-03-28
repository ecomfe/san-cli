/**
 * @file css-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({sourceMap, loaderOptions: {css = {}}}) => {
    return {
        name: 'css-loader',
        loader: require.resolve('css-loader'),
        options: {
            importLoaders: 1,
            sourceMap
        }
    };
};
