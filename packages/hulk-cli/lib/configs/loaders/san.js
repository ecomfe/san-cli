/**
 * @file san-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({mode, loaderOptions: {san = {}}}) => {
    const isProd = mode === 'production';
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
