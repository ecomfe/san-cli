/**
 * @file ejs loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({loaderOptions: {ejs = {}}}) => {
    return {
        name: 'ejs-loader',
        loader: require.resolve('ejs-loader')
    };
};
