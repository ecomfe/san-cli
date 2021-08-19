/**
 * @file
 * @author
 */

const fs = require('fs');
const path = require('path');
const resolveSync = require('resolve').sync;

module.exports = {
    id: 'alias',
    schema: joi => ({
        // webpack 相关配置
        alias: joi.object()
    }),
    apply(api, projectOptions = {}, options) {
        const {
            resolve,
            context,
            isProduction
        } = projectOptions;
        api.chainWebpack(chainConfig => {
            if (fs.existsSync(resolve('src'))) {
                chainConfig.resolve.alias
                    // 加个@默认值
                    .set('@', resolve('src'));
            }

            // set san alias
            try {
                const sanFile = resolveSync('san', {basedir: context});
                const sanPath = path.dirname(sanFile);
                chainConfig.resolve.alias.set(
                    'san',
                    path.join(sanPath, !isProduction() ? 'san.spa.dev.js' : 'san.spa.js')
                );
            } catch (e) {
                const sanPath = path.dirname(require.resolve('san'));
                chainConfig.resolve.alias.set(
                    'san',
                    path.join(sanPath, !isProduction() ? 'san.spa.dev.js' : 'san.spa.js')
                );
            }
            // projectOptions.alias
            if (projectOptions.alias) {
                let alias = projectOptions.alias;
                Object.keys(alias).forEach(k => {
                    let p = path.isAbsolute(alias[k]) ? alias[k] : resolve(alias[k]);
                    chainConfig.resolve.alias.set(k, p);
                });
            }
        });
    }
};
