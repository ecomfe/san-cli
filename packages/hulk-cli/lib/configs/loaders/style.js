/**
 * @file style-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({loaderOptions: {style = {}}}) => {
    return {
        name: 'style-loader',

        loader: require.resolve('style-loader'),
        options: style
    };
};
