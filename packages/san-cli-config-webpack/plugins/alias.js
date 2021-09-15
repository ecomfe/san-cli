/**
 * @file plugin alias
 * @author
 */

const fs = require('fs');
const path = require('path');
const resolveSync = require('resolve').sync;

module.exports = {
    id: 'alias',
    pickConfig: ['alias'],
    apply(api, options = {}) {
        api.chainWebpack(chainConfig => {
            if (fs.existsSync(api.resolve('src'))) {
                chainConfig.resolve.alias
                    // 加个@默认值
                    .set('@', api.resolve('src'));
            }

            // set san alias
            try {
                const sanFile = resolveSync('san', {basedir: api.getCwd()});
                const sanPath = path.dirname(sanFile);
                chainConfig.resolve.alias.set(
                    'san',
                    path.join(sanPath, !api.isProd() ? 'san.spa.dev.js' : 'san.spa.js')
                );
            } catch (e) {
                const sanPath = path.dirname(require.resolve('san'));
                chainConfig.resolve.alias.set(
                    'san',
                    path.join(sanPath, !api.isProd() ? 'san.spa.dev.js' : 'san.spa.js')
                );
            }
            if (options.alias) {
                let alias = options.alias;
                Object.keys(alias).forEach(k => {
                    let p = path.isAbsolute(alias[k]) ? alias[k] : api.resolve(alias[k]);
                    chainConfig.resolve.alias.set(k, p);
                });
            }
        });
    }
};
