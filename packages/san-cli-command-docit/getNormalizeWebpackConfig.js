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

    let entry;
    if (argv.entry) {
        entry = api.resolve(argv.entry);
    }

    const {isFile, type, isDirectory} = resolveEntry(entry);
    let {data: siteData, config: siteDataConfigPath} = loadConfig(isDirectory ? api.resolve(entry) : context) || {};

    siteData.rootUrl = publicUrl;
    // 不存在 siteDataConfig，则使用默认的
    if (!siteDataConfigPath) {
        siteDataConfigPath = require.resolve('./template/site.yml');
    }
    // 这个是解析的 codebox
    let theme = argv.theme || docitOptions.theme || siteData.theme;
    const layouts = (siteData.layouts = loadTheme(theme));
    let template = layouts.CodeBox || require.resolve('./template/CodeBox.san');

    // 增加 md loader
    // 来自 san.config.js component 扩展的配置
    api.chainWebpack(webpackConfig => {
        if (isFile) {
            if (type === 'js') {
                webpackConfig
                    .entry('app')
                    .add(entry)
                    .end();
            } else {
                addPage(
                    layouts,
                    projectOptions.outputDir,
                    [
                        {
                            filepath: entry,
                            filename: 'index.html',
                            chunkname: 'main'
                        }
                    ],
                    context,
                    webpackConfig,
                    siteData
                );
            }
        } else if (isDirectory) {
            const markdownFiles = globby.sync(['*.md', '*/*.md', '*.san', '*/*.san'], {
                cwd: entry,
                followSymbolicLinks: false,
                ignore: ['_*.md', '.*.md', 'node_modules']
            });

            addPage(layouts, projectOptions.outputDir, markdownFiles, api.resolve(entry), webpackConfig, siteData);
        }

        // 添加 config loader + alias
        webpackConfig.resolve.alias.set('@sitedata', siteDataConfigPath);
        webpackConfig.module
            .rule('yaml')
            .test(/\.ya?ml$/)
            .use('yaml-loader')
            .loader(require.resolve('./lib/configLoader.js'));

        // 判断存在_sidebar _navbar siteData 则添加 alias
        let {sidebar = '_sidebar.md', navbar = '_navbar.md'} = docitOptions;

        [
            [sidebar, '@sidebar'],
            [navbar, '@navbar']
        ].forEach(([filepath, aliasName]) => {
            const aliasfile = findExisting([filepath], isDirectory ? api.resolve(entry) : context);
            if (aliasfile) {
                webpackConfig.resolve.alias
                    // 加个🍗
                    .set(aliasName, `${aliasfile}?exportType=data`);
            } else {
                webpackConfig.resolve.alias
                    // 加个假的，防止找不到报错
                    .set(aliasName, `${require.resolve(`./template/${filepath}`)}?exportType=data`);
            }
        });

        // TODO 用 plugin 处理md 的链接 publicUrl？：支持 link 和 image 图片两种情况处理，相对路径添加 root

        // 设置统一的 md loader
        const baseRule = webpackConfig.module.rule('markdown').test(/\.md$/);
        baseRule
            .use('markdown-loader')
            .loader(require.resolve('@baidu/san-cli-markdown-loader'))
            .options(
                Object.assign({}, mdOptions, {
                    context: isDirectory ? api.resolve(entry) : context,
                    rootUrl: publicUrl,
                    codebox: template,
                    // 是否热更新
                    hotReload: api.isProd() ? false : true
                })
            );
        // 添加插件
        webpackConfig.plugin('san-cli-markdown-loader-plugin').use(require('@baidu/san-cli-markdown-loader/plugin'));
    });

    // 开始正式的操作
    let webpackConfig = api.getWebpackConfig();
    // console.log(webpackConfig.module.rules[4])
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
