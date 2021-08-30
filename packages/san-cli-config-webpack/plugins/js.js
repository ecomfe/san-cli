/**
 * @file plugin js
 * @author
 */

module.exports = {
    id: 'js',
    apply(api, projectOptions = {}, options) {
        const {
            loaderOptions = {}
        } = projectOptions;
        const esbuild = loaderOptions.esbuild;
        // 仅在生产环境可使用esbuild替换
        if (!api.isProd() && esbuild) {
            api.chainWebpack(chainConfig => {
                const esbuildLoaderFactory = require('../loaders/esbuild');

                const script = chainConfig.module
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
            });
        }
        else {
            const {apply} = require('san-cli-plugin-babel');
            apply(api, projectOptions, options);
        }
    }
};
