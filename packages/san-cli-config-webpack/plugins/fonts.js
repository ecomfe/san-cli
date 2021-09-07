/**
 * @file plugin fonts
 * @author
 */

const rules = require('../rules');
const {getAssetPath} = require('san-cli-utils/path');
const defaultsDeep = require('lodash.defaultsdeep');

module.exports = {
    id: 'fonts',
    pickConfig: {
        assetsDir: 'assetsDir',
        filenameHashing: 'filenameHashing',
        fontsOptions: 'loaderOptions.fonts',
        largeAssetSize: 'largeAssetSize'
    },
    apply(api, options = {}) {
        const {
            fontsOptions,
            filenameHashing,
            assetsDir,
            largeAssetSize = 1024
        } = options;
        api.chainWebpack(chainConfig => {
            // 使用url-loader 设置 img, media, fonts + svg-url设置svg
            if (fontsOptions !== false) {
                const opt = defaultsDeep(
                    fontsOptions || {},
                    {
                        limit: largeAssetSize,
                        name: getAssetPath(
                            assetsDir,
                            `fonts/[name]${filenameHashing ? '.[contenthash:8]' : ''}.[ext]`
                        )
                    }
                );

                rules.url(
                    chainConfig,
                    'fonts',
                    /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
                    opt
                );
            }
        });
    }
};
