/**
 * @file component command plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');

module.exports = {
    id: 'component-command-plugin',
    apply(api, options) {
        const context = api.getCwd();
        const HTMLPlugin = require('html-webpack-plugin');
        // 增加 md loader
        // 来自hulk.config.js component
        api.chainWebpack(webpackConfig => {
            const {template, ignore} = options.component || {};
            webpackConfig.module
                .rule('md')
                .test(/\.md$/)
                .use('markdown')
                .loader(require.resolve('@baidu/hulk-markdown-loader'))
                .options({context, template, ignore});

            // html 模板
            const defaultHtmlPath = path.resolve(__dirname, '../../template/webpack/component/index.html');
            const htmlPath = api.resolve('public/index.html');
            const htmlOptions = {
                inject: true,
                alwaysWriteToDisk: false, // 不写到本地，tpl 需要，我们不需要
                template: fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath
            };
            webpackConfig
                .entry('app')
                .add(require.resolve('../../template/webpack/main.js'))
                .end();

            // default, single page setup.
            webpackConfig.plugin('html').use(HTMLPlugin, [htmlOptions]);
        });
        api.configureWebpack(webpackConfig => {
            webpackConfig.entry = {};
        });
    }
};
