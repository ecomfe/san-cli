/**
 * @file plugin svg
 * @author
 */

const rules = require('../rules');
const {getAssetPath} = require('san-cli-utils/path');
const defaultsDeep = require('lodash.defaultsdeep');

module.exports = {
    id: 'svg',
    pickConfig: {
        assetsDir: 'assetsDir',
        filenameHashing: 'filenameHashing',
        svgOptions: 'loaderOptions.svg',
        largeAssetSize: 'largeAssetSize'
    },
    apply(api, options = {}) {
        const {
            svgOptions,
            filenameHashing,
            assetsDir,
            largeAssetSize = 1024
        } = options;
        api.chainWebpack(chainConfig => {
            // 使用url-loader 设置 img, media, fonts + svg-url设置svg
            if (svgOptions !== false) {
                const opt = defaultsDeep(
                    svgOptions || {},
                    {
                        limit: largeAssetSize,
                        name: getAssetPath(
                            assetsDir,
                            `svg/[name]${filenameHashing ? '.[contenthash:8]' : ''}.[ext]`
                        )
                    }
                );

                rules.svg(
                    chainConfig,
                    'svg',
                    /\.svg(\?.*)?$/,
                    opt
                );
            }
        });
    }
};
