module.exports = (webpackConfig, projectOptions) => {
    webpackConfig.mode('development');
    webpackConfig.devtool('eval-cheap-module-source-map');
    webpackConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));
    webpackConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
    const {cache, loaderOptions = {}} = projectOptions;
    const esbuild = loaderOptions.esbuild;
    // cache可以传false来禁止，或者传入object来配置
    const cacheOption = typeof cache === 'undefined' ? {
        type: 'filesystem',
        allowCollectingMemory: true
    } : cache;
    webpackConfig.cache(cacheOption);
    // 实验配置esbuild
    if (esbuild) {
        const esbuildLoaderFactory = require('../loaders/esbuild');

        const script = webpackConfig.module
            .rule('script')
            .test(/\.(m?j|t)s$/)
            .exclude.add(filepath => !filepath)
            .end();

        const {loader: esBuildLoader} = esbuildLoaderFactory();
        script.use('esbuild-loader')
            .loader(esBuildLoader)
            .options({
                target: typeof esbuild === 'object' && esbuild.target || 'es2015'
            });
    }
};
