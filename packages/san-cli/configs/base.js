const path = require('path');
module.exports = {
    id: 'built-in:base',
    apply(api, projectOptions) {
        api.chainWebpack(webpackConfig => {
            const isProd = api.isProd();
            // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy

            // set mode
            webpackConfig.mode(isProd ? 'production' : 'development').context(api.service.cwd);
            // set output
            webpackConfig.output
                .path(api.resolve(projectOptions.outputDir))
                // 留个小彩蛋吧~
                .jsonpFunction(projectOptions.jsonpFunction || 'Hulk3')
                .filename(`${isProd ? '.[hash:8]' : ''}.js`)
                .publicPath(projectOptions.publicPath);

            // prettier-ignore
            /* eslint-disable*/
            webpackConfig
                .resolve
                    .set('symlinks', false)
                    .extensions.merge(['.js', '.css', '.less', '.san'])
                    .end()
                .modules
                    .add('node_modules')
                    .add(api.resolve('node_modules'))
                    .end()
                .alias
                    .set('@', api.resolve('src'))
                    .set('core-js', path.dirname(require.resolve('core-js')))
                    .set('regenerator-runtime', path.dirname(require.resolve('regenerator-runtime')));
            // ----------------------pulgins---------------------
            // 大小写敏感！！！！
            webpackConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));
        });
    }
};
