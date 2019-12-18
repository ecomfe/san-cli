/**
 * @file svg-url-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {getAssetPath} = require('@baidu/san-cli-utils/path'); // eslint-disable-line
const factory = require('./loaderFactory');

module.exports = factory((options, {filenameHashing, assetsDir, largeAssetSize = 1024}) => {
    const dir = options.dir;
    delete options.dir;
    return {
        name: 'svg-url-loader',
        loader: require.resolve('svg-url-loader'),
        options: Object.assign(
            {
                limit: largeAssetSize,
                noquotes: true,
                name: getAssetPath(assetsDir, `${dir}/[name]${filenameHashing ? '.[hash:8]' : ''}.[ext]`)
            },
            options
        )
    };
});

