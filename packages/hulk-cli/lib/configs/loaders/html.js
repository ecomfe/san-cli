/**
 * @file html-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
module.exports = () => {
    return {
        name: 'html-loader',

        loader: require.resolve('html-loader'),
        options: {
            attrs: [':data-src']
        }
    };
};
