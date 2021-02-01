module.exports = (webpackConfig, projectOptions) => {
    webpackConfig.mode('development');
    webpackConfig.devtool('eval-cheap-module-source-map');
    webpackConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));
    webpackConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
};
