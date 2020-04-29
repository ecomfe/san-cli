/**
 * @file 添加 page 配置
 * @author ksky521
 */
const path = require('path');
const qs = require('querystring');
const fs = require('fs');
const grayMatter = require('gray-matter');
const {debug, error} = require('san-cli-utils/ttyLogger');
const {findExisting} = require('san-cli-utils/path');

function getChunkNameFromFilePath(filepath) {
    let {dir, name} = path.parse(filepath);
    if (/^readme$/i.test(name.toLowerCase())) {
        name = 'index';
    }
    // dir 'C:\\path\\dir'
    // dir "/home/user/dir"
    let chunkname = dir
        .replace(/^((\.+\/+|\/+))+/, '')
        .replace(/^[A-Z]:\\+/, '')
        .replace(/(\/|\\)+/g, '-');
    return (chunkname + '-' + name).replace(/^-+/, '');
}
const cachedMap = {};
module.exports = (layouts, output, files, context, webpackConfig, siteData) => {
    const HTMLPlugin = require('html-webpack-plugin');
    let htmlPath;
    if (cachedMap[context]) {
        htmlPath = cachedMap[context];
    }
    else {
        // 默认是找 public 的 docit.html，防止 index.html 作为它用
        htmlPath = findExisting(['public/docit.html', 'public/index.html'], context);
        if (htmlPath) {
            cachedMap[context] = htmlPath;
        }
    }

    // theme 包中的 html
    const themeHtml = layouts.template;
    // 默认路径
    const templatePath = fs.existsSync(themeHtml)
        ? themeHtml
        : fs.existsSync(htmlPath)
            ? htmlPath
            : require.resolve('../template/index.ejs');
    // 删除默认的配置
    webpackConfig.entryPoints.clear();
    webpackConfig.plugins.delete('html');
    webpackConfig.plugins.delete('html-webpack-harddisk-plugin');

    files
        .map(file => {
            const filepath = typeof file === 'string' ? file : file.filepath;
            return Object.assign(typeof file === 'string' ? {} : file, {
                filepath,
                absoluteFile: path.resolve(context, filepath)
            });
        })
        .map(({filepath, absoluteFile, filename, chunkname}) => {
            if (!filename) {
                const parsed = path.parse(filepath);
                parsed.ext = '.html';
                parsed.base = parsed.base.replace(/\.(md|markdown)$/, '.html').replace('README', 'index');
                filename = ensureRelative(output, path.format(parsed));
            }
            if (!chunkname) {
                chunkname = getChunkNameFromFilePath(filepath);
            }
            return {filepath, absoluteFile, filename, chunkname};
        })
        .forEach(({filepath, absoluteFile, filename, chunkname}) => {
            const content = fs.readFileSync(absoluteFile);
            const frontMatter = grayMatter(content);
            const matter = frontMatter.data || {};
            let entry = layouts.Main;
            if (matter.layout) {
                if (layouts[matter.layout]) {
                    // 存在
                    debug(`${filepath} use layout: ${matter.layout}`);
                    entry = layouts[matter.layout];
                }
                else {
                    error(`${filepath} layout \`${matter.layout}\` not found!`);
                }
            }
            // 读取下 matter 信息，传入进去，替换 title 等
            siteData = Object.assign(
                {
                    title: 'San Docit'
                },
                siteData,
                matter
            );
            const pageHtmlOptions = Object.assign(
                siteData,
                {
                    compile: false,
                    rootUrl: siteData.rootUrl,
                    chunks: ['common', 'vendors', chunkname],
                    template: templatePath,
                    filename
                }
            );
            // 删除没用的
            delete pageHtmlOptions.layouts;

            const query = qs.stringify({
                md: absoluteFile
            });
            // 添加个 query，然后在 resolve plugin 获取它
            webpackConfig
                .entry(chunkname)
                .add(`${entry}?${query}`);
            webpackConfig.plugin(`html-${chunkname}`).use(HTMLPlugin, [pageHtmlOptions]);
            const baseRule = webpackConfig.module.rule('entry-loader').test(a => {
                return new RegExp(entry).test(a);
            });
            baseRule
                .use('entry-loader')
                .loader(require.resolve('./entryLoader')).options(siteData);
        });
};
function ensureRelative(outputDir, p) {
    return path.isAbsolute(p) ? path.relative(outputDir, p) : p;
}
