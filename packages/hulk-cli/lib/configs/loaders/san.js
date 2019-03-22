/**
 * @file san-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({isProd, loaderOptions: {san = {}}}) => {
    return {
        name: 'san-loader',

        loader: require.resolve('@baidu/hulk-san-loader'),
        options: {
            hotReload: !isProd,
            sourceMap: !isProd,
            minimize: isProd
        }
    };
};
