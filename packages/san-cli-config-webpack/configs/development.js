module.exports = (webpackConfig, projectOptions) => {
    webpackConfig.mode('development');
    webpackConfig.devtool('eval-cheap-module-source-map');
    webpackConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));
    webpackConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
    const {cache, esbuild} = projectOptions;
    // cache可以传false来禁止，或者传入object来配置
    const cacheOption = typeof cache === 'undefined' ? {
        type: 'filesystem',
        allowCollectingMemory: true
    } : cache;
    webpackConfig.cache(cacheOption);
    // beta实验配置
    if (esbuild) {
        const esbuildLoaderFactory = require('../loaders/esbuild');

        const jsRule = webpackConfig.module
            .rule('js')
            .test(/\.m?js?$/)
            .exclude.add(filepath => !filepath)
            .end();

        const {loader: esBuildLoader} = esbuildLoaderFactory();
        jsRule.use('esbuild-loader')
            .loader(esBuildLoader)
            .options({
                target: esbuild.target || 'es2015'
            });
    }
};
