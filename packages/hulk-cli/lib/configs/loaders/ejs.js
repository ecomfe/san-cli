/**
 * @file ejs loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = () => {
    return {
        name: 'ejs-loader',
        loader: require.resolve('ejs-loader')
    };
};
