const path = require('path');
const fs = require('fs');
const defaultTheme = '@baidu/san-cli-docit-theme';
const {error} = require('@baidu/san-cli-utils/ttyLogger');
/* eslint-disable operator-linebreak */
module.exports = (theme, context = process.cwd()) => {
    if (typeof theme !== 'string') {
        theme = defaultTheme;
    }
    const oTheme = theme;
    if (path.isAbsolute(theme)) {
        // 绝对路径
    } else {
        // 1. 如果是@开头，则引入
        if (/^\./.test(theme)) {
            theme = path.resolve(context, theme);
        }
        // 2. 如果是./开头，则相对引入
    }
    let layouts = {
        Main: 'index.js',
        CodeBox: 'CodeBox.san'
    };

    try {
        const pkg = require(`${theme}/package.json`);

        if (pkg.docit && pkg.docit.layouts) {
            layouts = pkg.docit.layouts;
            if (!layouts.Main || typeof layouts.Main !== 'string' || fs.existsSync(path.resolve(theme, layouts.Main))) {
                error(`\`${oTheme}\` Main layout is not exist!`);
            }
        } else {
            if (fs.existsSync(require.resolve(theme))) {
                layouts.Main = require.resolve(theme);
            } else {
                error(`\`${oTheme}\` Main layout is not exist!`);
            }
        }
    } catch (e) {
        error(`\`${oTheme}\` error!`);
        error(e);
    }
    Object.keys(layouts).forEach(key => {
        layouts[key] = path.resolve(theme, layouts[key]);
    });
    // 1. 默认
    // 2. 读取配置 package.json,docit.layouts
    // 3. 处理相对路径
    return layouts;
};
