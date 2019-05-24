/**
 * @file component command plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    id: 'component-command-plugin',
    apply(api, options) {
        const context = api.getCwd();
        // 增加 md loader
        // 来自hulk.config.js component
        api.chainWebpack(webpackConfig => {
            const {template, ignore} = options.component || {};
            webpackConfig.module
                .rule('md')
                .test(/\.md$/)
                .use('markdown')
                .loader(require.resolve('@baidu/hulk-mdparse-loader'))
                .options({context, template, ignore});
        });
    }
};
