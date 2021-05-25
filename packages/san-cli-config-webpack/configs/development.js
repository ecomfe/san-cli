module.exports = (webpackConfig, projectOptions) => {
    // cache可以传false来禁止，或者传入object来配置
    const cache = typeof projectOptions.cache === 'undefined' ? {
        type: 'filesystem',
        allowCollectingMemory: true
    } : projectOptions.cache;
    webpackConfig.cache(cache);
    webpackConfig.mode('development');
    webpackConfig.devtool('eval-cheap-module-source-map');
    webpackConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));
    webpackConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
};
