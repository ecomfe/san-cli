const resolve = require('resolve');
const builtinLoaders = require('../loaders');

/**
 * 创建Rule
 * @param {Object} chainConfig webpack-chain instance
 * @param {string} name loader 名字
 * @param {Object} test loader test 正则
 * @param {Array} loaders loaders数组 item格式：[loader:string, options: object] | loader: string
 */
module.exports = function createRule(chainConfig, name, test, loaders) {
    const baseRule = chainConfig.module.rule(name).test(test);
    if (!Array.isArray(loaders)) {
        loaders = [loaders];
    }
    loaders.forEach(loaderName => {
        let loaderOptions;

        if (Array.isArray(loaderName)) {
            loaderOptions = loaderName[1];
            loaderName = loaderName[0];
        }

        if (builtinLoaders[loaderName]) {
            const loaderFactory = builtinLoaders[loaderName];
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
    return baseRule;
};
