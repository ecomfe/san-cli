/**
 * @file plugin js
 * @author
 */

module.exports = {
    id: 'js',
    pickConfig: {
        esbuildOptions: 'loaderOptions.esbuild',
        threadOptions: 'loaderOptions.thread',
        babelOptions: 'loaderOptions.babel',
        transpileDependencies: 'transpileDependencies',
        cache: 'cache'
    },
    apply(api, options = {}) {
        const esbuildOptions = options.esbuildOptions;
        // 仅在生产环境可使用esbuild替换
        if (!api.isProd() && esbuildOptions) {
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
                        target: typeof esbuildOptions === 'object' && esbuildOptions.target || 'es2015'
                    });
            });
        }
        else {
            const {apply} = require('san-cli-plugin-babel');
            apply(api, options);
        }
    }
};
