/**
 * @file style-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({mode, sourceMap}) => {
    return {
        name: 'style-loader',

        loader: require.resolve('style-loader'),
        options: {
            sourceMap
        }
    };
};
