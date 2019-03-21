/**
 * @file url-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {getAssetPath} = require('../../utils'); // eslint-disable-line

module.exports = ({mode, dir, assetsDir, largeAssetSize = 4096, loaderOptions: {url = {}}}) => {
    const isProd = mode === 'production';
    return {
        name: 'url-loader',

        loader: require.resolve('url-loader'),
        options: {
            limit: largeAssetSize,
            name: getAssetPath(assetsDir, `${dir}/[name]${isProd ? '.[hash:8]' : ''}.[ext]`)
        }
    };
};
