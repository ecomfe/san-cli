const resolve = require('resolve');
const WebpackChainConfig = require('webpack-chain');

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
    }
    removePlugin(name) {
        this.chainConfig.plugins.delete(name);
    }
    addPlugin(name, plugin, pluginOptions) {
        this.chainConfig.plugin(name).use(plugin, pluginOptions);
    }
    getChainConfig(mode) {
        return this.chainConfig;
    }
};
