/**
 * @file san-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({isProd}) => {
    return {
        name: 'san-loader',
        loader: 'hulk-san-loader',
        options: {
            hotReload: !isProd,
            sourceMap: !isProd,
            minimize: isProd
        }
    };
};
