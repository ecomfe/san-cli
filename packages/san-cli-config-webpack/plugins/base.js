/**
 * @file plugin base
 * @author
 */

const {defineVar, resolveLocal} = require('../utils');

module.exports = {
    id: 'base',
    schema: joi => ({
        // 主要用 splitChunks.cacheGroups
        splitChunks: joi.object(),
        // webpack5 runtimeChunk
        runtimeChunk: joi.alternatives().try(joi.string(), joi.object()),
        // 缓存的相关配置
        cache: joi.alternatives().try(joi.boolean(), joi.object())
    }),
    apply(api, projectOptions = {}, options) {
        const {
            splitChunks,
            runtimeChunk
        } = projectOptions;
        // san-cli里面必须的选项，用户不能更改的，在这里设置
        api.chainWebpack(chainConfig => {
            chainConfig.context(api.getCwd());

            chainConfig.resolve.modules
                .add('node_modules')
                .add(api.resolve('node_modules'))
                .add(resolveLocal('node_modules'))
                .end();

            // 大小写敏感！！！！
            chainConfig
                .plugin('case-sensitive-paths')
                .use(require('case-sensitive-paths-webpack-plugin'));

            // 定义 env 中的变量
            // 这里需要写到文档，以 SAN_VAR 开头的 env 变量
            chainConfig
                .plugin('define')
                .use(require('webpack/lib/DefinePlugin'), [defineVar(projectOptions)]);

            // development
            if (!api.isProd()) {
                chainConfig
                    .mode('development')
                    .devtool('eval-cheap-module-source-map');
                chainConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));
                chainConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
                const cache = projectOptions.cache;
                // cache可以传false来禁止，或者传入object来配置
                const cacheOption = typeof cache === 'undefined' ? {
                    type: 'filesystem',
                    allowCollectingMemory: true
                } : cache;
                chainConfig.cache(cacheOption);
            }
            // production
            else {
                // 条件判断sourcemap是否开启，san.config.js传入
                let ifSourcemap = false;
                if (projectOptions.sourceMap) {
                    ifSourcemap = true;
                }
                chainConfig
                    .mode('production')
                    .devtool(
                        ifSourcemap
                            ? typeof projectOptions.sourceMap === 'string'
                                ? projectOptions.sourceMap
                                : 'source-map'
                            : false
                    );


                if (splitChunks) {
                    chainConfig.optimization.splitChunks(splitChunks);
                }
                if (runtimeChunk) {
                    chainConfig.optimization.runtimeChunk(runtimeChunk);
                }
            }
        });
    }
};
