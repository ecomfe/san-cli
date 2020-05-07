/**
 * @file 加载 theme
 * @author ksky521
 */
const path = require('path');
const fs = require('fs');
const defaultTheme = 'san-cli-docit-theme';
const {error} = require('san-cli-utils/ttyLogger');
const defaultLayouts = {
    template: require.resolve('../template/index.ejs'),
    CodeBox: require.resolve('../template/CodeBox.san')
};
/* eslint-disable operator-linebreak */
module.exports = (theme, context = process.cwd()) => {
    if (typeof theme !== 'string') {
        theme = defaultTheme;
    }
    const oTheme = theme;
    if (!path.isAbsolute(theme)) {
        // 1. 如果是@开头，则引入
        if (/^\./.test(theme)) {
            theme = path.resolve(context, theme);
        }
        // 2. 如果是./开头，则相对引入
    }
    let layouts = {
        Main: 'index.js',
        Markdown: 'markdown.js',
        CodeBox: 'CodeBox.san',
        template: 'index.ejs'
    };

    let contextPath = theme;
    try {
        const pkg = require(`${theme}/package.json`);
        contextPath = path.dirname(require.resolve(`${theme}/package.json`));
        if (pkg.docit && pkg.docit.layouts) {
            layouts = pkg.docit.layouts;
            // prettier-ignore
            /* eslint-disable max-len */
            if (!layouts.Main || typeof layouts.Main !== 'string' || fs.existsSync(path.resolve(contextPath, layouts.Main))) {
                error(`\`${oTheme}\` Main layout is not exist!`);
            }
        }
        else {
            if (fs.existsSync(require.resolve(theme))) {
                layouts.Main = require.resolve(theme);
            }
            else {
                error(`\`${oTheme}\` Main layout is not exist!`);
            }
        }
    }
    catch (e) {
        error(`\`${oTheme}\` error!`);
        error(e);
    }
    Object.keys(layouts).forEach(key => {
        // TODO 判断下是否存在，不存在则设置默认值？
        const p = path.resolve(contextPath, layouts[key]);
        if (key === 'Markdown') {
            // 单独给 docit x.md 一个文件，如果不存在则直接使用Main
            layouts[key] = fs.existsSync(p) ? p : layouts.Main ? layouts.Main : p;
        }
        else {

            layouts[key] = fs.existsSync(p) ? p : defaultLayouts[key] ? defaultLayouts[key] : p;
        }
    });
    // 添加个模板路径
    layouts._themePath = theme;
    // 1. 默认
    // 2. 读取配置 package.json,docit.layouts
    // 3. 处理相对路径
    return layouts;
};
