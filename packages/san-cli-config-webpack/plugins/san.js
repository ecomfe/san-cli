/**
 * @file plugin san
 * @author
 */

const rules = require('../rules');

module.exports = {
    id: 'san',
    apply(api, projectOptions = {}, options) {
        const {
            loaderOptions = {}
        } = projectOptions;

        api.chainWebpack(chainConfig => {

            // set loaders
            // ------------------------loaders------------
            if (loaderOptions.san !== false) {
                const sanLoaders = [['san', loaderOptions.san]];
                if (!api.isProd() && loaderOptions['san-hot'] !== false) {
                    sanLoaders.unshift(['san-hot', loaderOptions['san-hot']]);
                }
                rules.createRule(chainConfig, 'san', /\.san$/, sanLoaders);
            }

            // -----------plugins--------
            chainConfig.plugin('san').use(require('san-loader/lib/plugin'));
        });
    }
};
