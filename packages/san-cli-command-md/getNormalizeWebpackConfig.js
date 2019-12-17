/**
 * @file getNormalizeWebpackConfig
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fse = require('fs-extra');
const {error, debug} = require('@baidu/san-cli-utils/ttyLogger');

module.exports = function getNormalizeWebpackConfig(argv, api, projectOptions) {
    // 放到这里，是用了 argv.dtemplate
    const mdOptions = (projectOptions.loaderOptions || {}).markdown || {};
    const isProd = api.isProd();
    const context = api.getCwd();

    let template = argv.template || mdOptions.template;
    if (template) {
        if (fse.existsSync(api.resolve(template))) {
            template = api.resolve(template);
        } else {
            template = undefined;
            error(`${argv.template} is not exist`);
        }
    }
    let entry;
    if (argv.entry) {
        entry = api.resolve(argv.entry);
    }
    // 增加 md loader
    // 来自 san.config.js component 扩展的配置
    api.chainWebpack(webpackConfig => {
        // 设置统一的 md loader

        const {isFile, type} = resolveEntry(entry);

        if (isFile) {
            if (type === 'js') {
                webpackConfig
                    .entry('app')
                    .add(entry)
                    .end();
            } else {
                webpackConfig.resolve.alias
                    // 加个@默认值
                    .set('~entry', entry);
                webpackConfig
                    .entry('app')
                    .add(require.resolve('./template/main.js'))
                    .end();
            }
        }

        const baseRule = webpackConfig.module.rule('markdown').test(/\.(md|markdown)$/);

        baseRule
            .use('markdown-loader')
            .loader(require.resolve('@baidu/san-cli-markdown-loader'))
            .options(Object.assign({}, mdOptions, {context, template}));

        // 添加插件
        webpackConfig.plugin('san-cli-markdown-loader-plugin').use(require('@baidu/san-cli-markdown-loader/plugin'));
    });

    // 开始正式的操作
    let webpackConfig = api.getWebpackConfig();
    debug(webpackConfig);

    webpackConfig.devServer = Object.assign({hot: !isProd, compress: isProd}, webpackConfig.devServer);
    return webpackConfig;
};

function resolveEntry(entry) {
    let isFile = false;
    let ext;
    try {
        const stats = fse.statSync(entry);
        if (stats.isFile()) {
            ext = path.extname(entry);
            if (ext === '.md' || ext === '.js' || ext === '.markdown') {
                isFile = true;
            } else {
                error('A valid entry file should be one of: *.js or *.san.');
                process.exit(1);
            }
            isFile = true;
        }
    } catch (e) {
        return {isFile: false};
    }
    return {
        type: ext.replace(/^./, ''),
        entry,
        isFile
    };
}
