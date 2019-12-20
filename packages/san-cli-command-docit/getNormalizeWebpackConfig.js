/**
 * @file getNormalizeWebpackConfig
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fse = require('fs-extra');
const {error, debug} = require('@baidu/san-cli-utils/ttyLogger');
const {findExisting} = require('@baidu/san-cli-utils/path');
const importLazy = require('import-lazy')(require);
const globby = importLazy('globby');

module.exports = function getNormalizeWebpackConfig(argv, api, projectOptions) {
    // 放到这里，是用了 argv.dtemplate
    const docitOptions = projectOptions.docit || {};
    const mdOptions = (projectOptions.loaderOptions || docitOptions).markdown || {};
    const isProd = api.isProd();
    const context = api.getCwd();
    const publicUrl = projectOptions.publicUrl;

    const loadConfig = require('./lib/loadConfig');
    const loadTheme = require('./lib/loadTheme');
    const addPage = require('./lib/addPage');

    const siteData = loadConfig(context) || {};
    siteData.rootUrl = publicUrl;
    let template = argv.template || docitOptions.codebox;
    let theme = argv.theme || docitOptions.theme || siteData.theme;
    const layouts = (siteData.layouts = loadTheme(theme));

    if (template) {
        if (fse.existsSync(api.resolve(template))) {
            template = api.resolve(template);
        } else {
            template = undefined;
            error(`${argv.template} is not exist`);
        }
    } else {
        template = layouts.CodeBox || '';
    }
    let entry;
    if (argv.entry) {
        entry = api.resolve(argv.entry);
    }
    // 增加 md loader
    // 来自 san.config.js component 扩展的配置
    api.chainWebpack(webpackConfig => {
        // 设置统一的 md loader

        const {isFile, type, isDirectory} = resolveEntry(entry);
        if (isFile) {
            if (type === 'js') {
                webpackConfig
                    .entry('app')
                    .add(entry)
                    .end();
            } else {
                addPage(layouts, projectOptions.outputDir, [entry], context, webpackConfig, siteData);
            }
        } else if (isDirectory) {
            // TODO 这里遍历所有的 md，添加 html 配置

            const markdownFiles = globby.sync(['*.md', '*/*.md', '*.san', '*/*.san'], {
                cwd: entry,
                followSymbolicLinks: false,
                ignore: ['_*.md', '.*.md', 'node_modules']
            });

            addPage(layouts, projectOptions.outputDir, markdownFiles, api.resolve(entry), webpackConfig, siteData);
        }

        let {sidebar = '_sidebar.md', navbar = '_navbar.md'} = docitOptions;

        // 判断存在_sidebar _navbar siteData 则添加 alias
        [
            [sidebar, '@sidebar'],
            [navbar, '@navbar']
        ].forEach(([filepath, aliasName]) => {
            filepath = findExisting([filepath], isDirectory ? api.resolve(entry) : context);
            if (filepath) {
                webpackConfig.resolve.alias
                    // 加个🍗
                    .set(aliasName, `${filepath}?exportType=data`);
            }
        });

        // TODO 用 plugin 处理md 的链接 publicUrl？：支持 link 和 image 图片两种情况处理，相对路径添加 root
        const baseRule = webpackConfig.module.rule('markdown').test(/\.md$/);

        baseRule
            .use('markdown-loader')
            .loader(require.resolve('@baidu/san-cli-markdown-loader'))
            .options(
                Object.assign({}, mdOptions, {
                    context: isDirectory ? api.resolve(entry) : context,
                    rootUrl: publicUrl,
                    codebox: template
                })
            );
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
    let isDirectory = false;
    let ext = '';
    try {
        const stats = fse.statSync(entry);
        isDirectory = stats.isDirectory();
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
        isFile,
        isDirectory
    };
}
