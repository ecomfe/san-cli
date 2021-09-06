/**
 * @file plugin image
 * @author
 */

const rules = require('../rules');
const {getAssetPath} = require('san-cli-utils/path');
const defaultsDeep = require('lodash.defaultsdeep');

module.exports = {
    id: 'image',
    pickConfig: {
        assetsDir: 'assetsDir',
        filenameHashing: 'filenameHashing',
        imageOptions: 'loaderOptions.image',
        largeAssetSize: 'largeAssetSize'
    },
    apply(api, options = {}) {
        const {
            imageOptions,
            filenameHashing,
            assetsDir,
            largeAssetSize = 1024
        } = options;
        api.chainWebpack(chainConfig => {
            // 使用url-loader 设置 img, media, fonts + svg-url设置svg
            if (imageOptions !== false) {
                const opt = defaultsDeep(
                    imageOptions || {},
                    {
                        limit: largeAssetSize,
                        name: getAssetPath(
                            assetsDir,
                            `image/[name]${filenameHashing ? '.[contenthash:8]' : ''}.[ext]`
                        )
                    }
                );

                rules.url(
                    chainConfig,
                    'image',
                    /\.(png|jpe?g|gif|webp)(\?.*)?$/,
                    opt
                );
            }
        });
    }
};
