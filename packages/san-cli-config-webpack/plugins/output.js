/**
 * @file
 * @author
 */

const {getAssetPath} = require('san-cli-utils/path');

// 一个标准的插件
module.exports = {
    id: 'output',
    schema: joi => ({
        // 产出相关
        publicPath: joi.string().allow(''),
        assetsDir: joi.string().allow(''),
        outputDir: joi.string()
    }),
    apply(api, projectOptions = {}, options) {
        const {
            resolve,
            isLegacyBundle,
            isProduction,
            outputDir,
            assetsDir,
            publicPath,
            filenameHashing
        } = projectOptions;
        api.chainWebpack(chainConfig => {
            // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
            // set output
            // prettier-ignore
            chainConfig.output
                .path(resolve(outputDir))
                /* eslint-disable max-len */
                .filename((isLegacyBundle() ? '[name]-legacy' : '[name]') + `${filenameHashing ? '.[contenthash:8]' : ''}.js`)
                /* eslint-enable max-len */
                .publicPath(publicPath)
                .pathinfo(false);
            // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
            if (isProduction()) {
                const filename = getAssetPath(
                    assetsDir,
                    `js/[name]${isLegacyBundle() ? '-legacy' : ''}${filenameHashing ? '.[contenthash:8]' : ''}.js`
                );
                chainConfig.output
                    .filename(filename)
                    .chunkFilename(filename);
            }
        });
    }
};
