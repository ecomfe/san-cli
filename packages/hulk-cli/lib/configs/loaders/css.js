/**
 * @file css-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({mode = 'development', sourceMap}) => {
    return {
        name: 'css-loader',
        loader: require.resolve('css-loader'),
        options: {
            sourceMap
        }
    };
};
