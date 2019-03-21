/**
 * @file component command config file
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');

module.exports = {
    id: 'component',
    apply: (api, options) => {
        api.chainWebpack(config => {
            const context = api.getCwd();

            // 来自hulk.config.js component
            const {template, ignore} = options.component || {};

            // 增加 md
            config.module
                .rule('md')
                .test(/\.md$/)
                .use('san-loader')
                .loader(require.resolve('@baidu/hulk-san-loader'))
                .options({
                    hotReload: true,
                    sourceMap: true,
                    minimize: false
                })
                .end()
                .use('markdown')
                .loader(require.resolve('@baidu/hulk-markdown-loader'))
                .options({context, template, ignore});

            if (fs.existsSync(api.resolve('src'))) {
                config.resolve.alias.set('@', api.resolve('src'));
            } else {
                config.resolve.alias.set('@', api.resolve('.'));
            }
        });
    }
};
