/**
 * @file getNormalizeWebpackConfig
 * @author ksky521
 */
const path = require('path');
const fse = require('fs-extra');
const {error, getDebugLogger} = require('san-cli-utils/ttyLogger');
const {findExisting} = require('san-cli-utils/path');
const importLazy = require('import-lazy')(require);
const globby = importLazy('globby');
const debug = getDebugLogger('docit');

module.exports = function getNormalizeWebpackConfig(argv, api, projectOptions) {
    // 放到这里，是用了 argv.dtemplate
    const docitOptions = projectOptions.docit || {};
    let mdOptions = docitOptions.markdown || {};

    const isProd = api.isProd();
    const context = api.getCwd();
    const publicPath = projectOptions.publicPath;

    const loadConfig = require('./lib/loadConfig');
    const loadTheme = require('./lib/loadTheme');
    const addPage = require('./lib/addPage');

    let entry;
    if (argv.entry) {
        entry = api.resolve(argv.entry);
    }

    const {isFile, type, isDirectory} = resolveEntry(entry || context);
    let {data: siteData} = loadConfig(isDirectory ? api.resolve(entry) : context) || {};

    siteData.rootUrl = publicPath;
    // 这个是解析的 codebox
    let theme = argv.theme || siteData.theme || docitOptions.theme;
    const layouts = (siteData.layouts = loadTheme(theme));
    // codebox template
    let template = layouts.CodeBox;
    // 判断存在_sidebar _navbar siteData 则添加 alias
    let sidebar = siteData.sidebar || docitOptions.sidebar || '_sidebar.md';
    let navbar = siteData.navbar || docitOptions.navbar || '_navbar.md';

    [
        [sidebar, 'sidebar'],
        [navbar, 'navbar']
    ].forEach(([filepath, name]) => {
        const aliasfile = findExisting(
            [filepath, path.resolve(__dirname, './template', filepath)],
            isDirectory ? api.resolve(entry) : context
        );
        // 这里为了避免不存在路径的时候报错，处理不是很合适
        siteData[name] = aliasfile;
    });

    // 增加 md loader
    // 来自 san.config.js component 扩展的配置
    api.chainWebpack(webpackConfig => {
        if (isFile) {
            if (type === 'js') {
                webpackConfig
                    .entry('app')
                    .add(entry)
                    .end();
            }
            else {
                addPage(
                    [
                        {
                            filepath: entry,
                            filename: 'index.html',
                            chunkname: 'main',
                            // 专门个 markdown 单页添加的
                            layout: 'Markdown'
                        }
                    ], {
                        layouts,
                        output: projectOptions.outputDir,
                        context,
                        webpackConfig,
                        siteData
                    }
                );
            }
        }
        else if (isDirectory) {
            let context = api.resolve(entry);
            const markdownFiles = globby.sync(['*.md', '*/*.md'], {
                cwd: context,
                followSymbolicLinks: false,
                ignore: ['_*.md', '.*.md', 'node_modules']
            });

            addPage(markdownFiles, {
                layouts,
                output: projectOptions.outputDir,
                context,
                webpackConfig,
                siteData
            });
        }
        else {
            error(`\`${argv.entry}\` is not exist!`);
            process.exit(1);
        }

        let docContext = isDirectory ? api.resolve(entry) : context;
        mdOptions = Object.assign(mdOptions, {
            cwd: docContext,
            rootUrl: publicPath,
            codebox: template
        });

        // TODO 用 plugin 处理md 的链接 publicUrl？：支持 link 和 image 图片两种情况处理，相对路径添加 root
        // 设置统一的 md loader
        webpackConfig.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'));
        const baseRule = webpackConfig.module.rule('markdown').test(/\.md$/);
        baseRule
            .use('markdown-loader')
            .loader('san-cli-markdown-loader')
            .options(mdOptions);
        // 添加插件
        webpackConfig.plugin('san-cli-markdown-loader-plugin').use(require('san-cli-markdown-loader/plugin'));
    });

    // 开始正式的操作
    let webpackConfig = api.getWebpackConfig();
    debug('webpack config %O', webpackConfig);
    if (argv.output) {
        // build 模式，删掉 webpack devServer；
        delete webpackConfig.devServer;
    }
    else {
        webpackConfig.devServer = Object.assign({hot: !isProd, compress: isProd}, webpackConfig.devServer);
    }
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
            }
            else {
                error('A valid entry file should be one of: *.js or *.san.');
                process.exit(1);
            }
            isFile = true;
        }
    }
    catch (e) {
        return {isFile: false};
    }
    return {
        type: ext.replace(/^./, ''),
        entry,
        isFile,
        isDirectory
    };
}
