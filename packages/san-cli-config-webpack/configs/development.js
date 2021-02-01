module.exports = (webpackChainConfig, projectOptions) => {
    webpackChainConfig.devtool('eval-cheap-module-source-map');
    webpackChainConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));
    webpackChainConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
};
