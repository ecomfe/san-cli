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
    if (/^readme$/i.test(name)) {
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
    // 默认路径
    const defaultHtmlPath = path.resolve(__dirname, '../template/index.html');
    const templatePath = fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath;
    webpackConfig.entryPoints.clear();

    files
        .map(file => [file, path.resolve(context, file)])
        .forEach(([shortFile, absoluteFile]) => {
            const parsed = path.parse(shortFile);
            parsed.ext = '.html';
            parsed.base = parsed.base.replace(/\.(md|markdown)$/, '.html');
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
            const pageHtmlOptions = Object.assign(siteData, matter, {
                chunks: [chunkname],
                template: templatePath,
                filename: ensureRelative(output, path.format(parsed))
            });

            // 添加个 query，然后在 resolve plugin 获取它
            webpackConfig.entry(chunkname).add(absoluteFile).add(`${entry}`);
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
