/**
 * @file plugin image
 * @author
 */

const rules = require('../rules');
const {getAssetPath} = require('san-cli-utils/path');
const defaultsDeep = require('lodash.defaultsdeep');

module.exports = {
    id: 'image',
    schema: joi => ({
        assetsDir: joi.string().allow(''),
        filenameHashing: joi.boolean(),
        loaderOptions: joi.object(),
        largeAssetSize: joi.number()
    }),
    apply(api, options = {}) {
        const {
            loaderOptions = {},
            filenameHashing,
            assetsDir,
            largeAssetSize = 1024
        } = options;
        api.chainWebpack(chainConfig => {
            // 使用url-loader 设置 img, media, fonts + svg-url设置svg
            [
                ['image', /\.(png|jpe?g|gif|webp)(\?.*)?$/, 'url']
            ].forEach(([name, test, loader]) => {
                if (loaderOptions[name] !== false) {
                    const opt = defaultsDeep(
                        loaderOptions[name] || {},
                        {
                            limit: largeAssetSize,
                            name: getAssetPath(
                                assetsDir,
                                `${name}/[name]${filenameHashing ? '.[contenthash:8]' : ''}.[ext]`
                            )
                        }
                    );

                    rules[loader](
                        chainConfig,
                        name,
                        test,
                        opt
                    );
                }
            });
        });
    }
};
