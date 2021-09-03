/**
 * @file plugin media
 * @author
 */

const rules = require('../rules');
const {getAssetPath} = require('san-cli-utils/path');
const defaultsDeep = require('lodash.defaultsdeep');

module.exports = {
    id: 'media',
    pickConfig: {
        assetsDir: 'assetsDir',
        filenameHashing: 'filenameHashing',
        mediaOptions: 'loaderOptions.media',
        largeAssetSize: 'largeAssetSize'
    },
    apply(api, options = {}) {
        const {
            mediaOptions,
            filenameHashing,
            assetsDir,
            largeAssetSize = 1024
        } = options;
        api.chainWebpack(chainConfig => {
            // 使用url-loader 设置 img, media, fonts + svg-url设置svg
            if (mediaOptions !== false) {
                const opt = defaultsDeep(
                    mediaOptions || {},
                    {
                        limit: largeAssetSize,
                        name: getAssetPath(
                            assetsDir,
                            `media/[name]${filenameHashing ? '.[contenthash:8]' : ''}.[ext]`
                        )
                    }
                );

                rules.url(
                    chainConfig,
                    'media',
                    /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    opt
                );
            }
        });
    }
};
