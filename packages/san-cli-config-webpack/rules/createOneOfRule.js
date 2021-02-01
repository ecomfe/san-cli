const resolve = require('resolve');
const builtinLoaders = require('./loaders');

module.exports = function createOneOfRule(chainConfig, name, test, oneOfs) {
    const baseRule = chainConfig.module.rule(name).test(test);
    if (!Array.isArray(oneOfs)) {
        oneOfs = [oneOfs];
    }
    oneOfs.forEach(({name, resourceQuery, loader: loaderName, options: loaderOptions, test}) => {
        if (builtinLoaders[loaderName]) {
            const loaderFactory = builtinLoaders[loaderName];
            loaderOptions = loaderFactory(loaderOptions);
        }
        let {loader, options} = loaderOptions;
        if (!loader) {
            loader = resolve.sync(loaderName);
        }
        let r = baseRule.oneOf(name);
        if (resourceQuery) {
            r = r.resourceQuery(resourceQuery);
        }
        if (test) {
            r = r.test(test);
        }

        r.use(loaderName)
            .loader(loader)
            .options(options)
            .end()
            .end();
    });

    /*
    config.module
    .rule('css')
        .oneOf('inline')
        .resourceQuery(/inline/)
        .use('url')
            .loader('url-loader')
            .end()
        .end()
        .oneOf('external')
        .resourceQuery(/external/)
        .use('file')
            .loader('file-loader')

            config.module
    .rule('scss')
        .test(/\.scss$/)
        .oneOf('vue')
        .resourceQuery(/\?vue/)
        .use('vue-style')
            .loader('vue-style-loader')
            .end()
        .end()
        .oneOf('normal')
        .use('sass')
            .loader('sass-loader')
            .end()
        .end()
        .oneOf('sass-vars')
        .after('vue')
        .resourceQuery(/\?sassvars/)
        .use('sass-vars')
            .loader('sass-vars-to-js-loader')
            */
};
