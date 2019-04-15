/**
 * @file url-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {getAssetPath} = require('../../utils'); // eslint-disable-line

module.exports = ({isProd, dir, assetsDir, largeAssetSize = 1024, loaderOptions: {url = {}}}) => {
    return {
        name: 'svg-url-loader',
        loader: require.resolve('svg-url-loader'),
        options: {
            limit: largeAssetSize,
            noquotes: true,
            name: getAssetPath(assetsDir, `${dir}/[name]${isProd ? '.[hash:8]' : ''}.[ext]`)
        }
    };
};


