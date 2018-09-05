/**
 * @file 跟路径相关
 */
const path = require('path');

exports.isLocalPath = templatePath => {
    return /^[./]|(^[a-zA-Z]:)/.test(templatePath);
};

exports.getTemplatePath = templatePath => {
    return path.isAbsolute(templatePath)
        ? templatePath
        : path.normalize(path.join(process.cwd(), templatePath));
};
