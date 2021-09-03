/**
 * @file plugin output
 * @author
 */

const {getAssetPath} = require('san-cli-utils/path');

// 一个标准的插件
module.exports = {
    id: 'output',
    pickConfig: [
        // 产出相关
        'publicPath',
        'assetsDir',
        'outputDir',
        'filenameHashing'
    ],
    apply(api, options = {}) {
        const {
            outputDir,
            assetsDir,
            publicPath,
            filenameHashing
        } = options;
        api.chainWebpack(chainConfig => {
            // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
            // set output
            // prettier-ignore
            chainConfig.output
                .path(api.resolve(outputDir))
                /* eslint-disable max-len */
                .filename((api.isLegacyBundle() ? '[name]-legacy' : '[name]') + `${filenameHashing ? '.[contenthash:8]' : ''}.js`)
                /* eslint-enable max-len */
                .publicPath(publicPath)
                .pathinfo(false);
            // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
            if (api.isProd()) {
                const filename = getAssetPath(
                    assetsDir,
                    `js/[name]${api.isLegacyBundle() ? '-legacy' : ''}${filenameHashing ? '.[contenthash:8]' : ''}.js`
                );
                chainConfig.output
                    .filename(filename)
                    .chunkFilename(filename);
            }
        });
    }
};
