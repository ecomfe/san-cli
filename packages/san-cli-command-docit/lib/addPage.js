/**
 * @file 添加 page 配置
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');
const grayMatter = require('gray-matter');
const {debug, error} = require('@baidu/san-cli-utils/ttyLogger');
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
module.exports = (layouts, output, files, context, webpackConfig, siteData) => {
    const HTMLPlugin = require('html-webpack-plugin');
    const htmlPath = path.resolve(context, 'public/index.html');
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
        .map(file => [file, path.resolve(context, file)])
        .forEach(([shortFile, absoluteFile]) => {
            const parsed = path.parse(shortFile);
            parsed.ext = '.html';
            parsed.base = parsed.base.replace(/\.(md|markdown)$/, '.html').replace('README', 'index');
            const chunkname = getChunkNameFromFilePath(shortFile);
            const content = fs.readFileSync(absoluteFile);
            const frontMatter = grayMatter(content);
            const matter = frontMatter.data || {};
            let entry = layouts.Main;
            if (matter.layout) {
                if (layouts[matter.layout]) {
                    // 存在
                    debug(`${shortFile} use layout: ${matter.layout}`);
                    entry = layouts[matter.layout];
                } else {
                    error(`${shortFile} layout \`${matter.layout}\` not found!`);
                }
            }
            // 读取下 matter 信息，传入进去，替换 title 等
            const pageHtmlOptions = Object.assign({}, siteData, matter, {
                compile: false,
                publicUrl: siteData.rootUrl,
                chunks: [chunkname],
                template: templatePath,
                filename: ensureRelative(output, path.format(parsed))
            });
            // 删除没用的
            delete pageHtmlOptions.layouts;

            // 添加个 query，然后在 resolve plugin 获取它
            webpackConfig
                .entry(chunkname)
                .add(absoluteFile)
                .add(`${entry}`);
            webpackConfig.plugin(`html-${chunkname}`).use(HTMLPlugin, [pageHtmlOptions]);
        });
};
function ensureRelative(outputDir, p) {
    if (path.isAbsolute(p)) {
        return path.relative(outputDir, p);
    } else {
        return p;
    }
}
