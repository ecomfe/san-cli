/**
 * @file html-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
module.exports = ({loaderOptions: {html = {}}}) => {
    return {
        name: 'html-loader',

        loader: require.resolve('html-loader'),
        options: {
            attrs: [':data-src']
        }
    };
};
