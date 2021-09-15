/**
 * @file plugin san
 * @author
 */

const rules = require('../rules');

module.exports = {
    id: 'san',
    pickConfig: {
        sanOptions: 'loaderOptions.san',
        sanHotOptions: 'loaderOptions.san-hot'
    },
    apply(api, options = {}) {
        const {
            sanOptions,
            sanHotOptions
        } = options;
        api.chainWebpack(chainConfig => {

            // set loaders
            // ------------------------loaders------------
            if (sanOptions !== false) {
                const sanLoaders = [['san', sanOptions]];
                if (!api.isProd() && sanHotOptions !== false) {
                    sanLoaders.unshift(['san-hot', sanHotOptions]);
                }
                rules.createRule(chainConfig, 'san', /\.san$/, sanLoaders);
            }

            // -----------plugins--------
            chainConfig.plugin('san').use(require('san-loader/lib/plugin'));
        });
    }
};
