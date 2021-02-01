const resolve = require('resolve');
const WebpackChainConfig = require('webpack-chain');
const loaders = require('./loaders');
module.exports = class Confing {
    constructor(webpackChainConfig) {
        this.chainConfig = webpackChainConfig || new WebpackChainConfig();
    }
    /**
     * 创建Rule
     * @param {string} name loader 名字
     * @param {Object} test loader test 正则
     * @param {Array} loaders loaders数组 item格式：[loader:string, options: object] | loader: string
     */
    createRule(name, test, loaders) {
        const baseRule = this.chainConfig.module.rule(name).test(test);
        if (!Array.isArray(loaders)) {
            loaders = [loaders];
        }
        loaders.forEach(loaderName => {
            let loaderOptions;

            if (Array.isArray(loaderName)) {
                loaderOptions = loaderName[1];
                loaderName = loaderName[0];
            }

            if (loaders[loaderName]) {
                const loaderFactory = loaders[loaderName];
                loaderOptions = loaderFactory(loaderOptions);
            }
            let {loader, options} = loaderOptions;
            if (!loader) {
                loader = resolve.sync(loaderName);
            }
            baseRule
                .use(loaderName)
                .loader(loader)
                .options(options)
                .end();
        });
        return this;
    }
    getRuleByName(name) {
        return this.chainConfig.module.rule(name);
    }
    // 根据namne删除rule
    removeRule(name) {
        const map = this.getRuleByName(name);
        if (map) {
            for (let [name] of map) {
                map.delete(name);
            }
        }
        return this;
    }
    createOneOfRule(name, test, oneOfs) {
        const baseRule = this.chainConfig.module.rule(name).test(test);
        if (!Array.isArray(oneOfs)) {
            oneOfs = [oneOfs];
        }
        oneOfs.forEach(({name, resourceQuery, loader: loaderName, options: loaderOptions}) => {
            if (loaders[loaderName]) {
                const loaderFactory = loaders[loaderName];
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

            r.use(loaderName)
                .loader(loader)
                .options(options)
                .end()
                .end();
        });
        return this;

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
    }
    removePlugin(name) {
        this.chainConfig.plugins.delete(name);
        return this;
    }
    addPlugin(name, plugin, pluginOptions) {
        this.chainConfig.plugin(name).use(plugin, pluginOptions);
        return this;
    }
    getConfig(mode) {
        return this.chainConfig;
    }
    toConfig() {
        return this.chainConfig.toConfig();
    }
};
