/**
 * @file plugin san
 * @author
 */

const rules = require('../rules');
const {resolveEsmodule} = require('../utils');

module.exports = {
    id: 'san',
    pickConfig: {
        sanOptions: 'loaderOptions.san',
        sanHotOptions: 'loaderOptions.san-hot',
        esModule: 'esModule'
    },
    apply(api, options = {}) {
        const {
            sanOptions,
            sanHotOptions,
            esModule
        } = options;
        api.chainWebpack(chainConfig => {

            // set loaders
            // ------------------------loaders------------
            if (sanOptions !== false) {
                const sanLoaders = [['san', resolveEsmodule(sanOptions, esModule)]];
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
