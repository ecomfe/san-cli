/**
 * @file 工具函数全部整理到 utils.js
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const {chalk} = require('./ttyLogger');

exports.isLocalPath = templatePath => {
    return /^[./]|(^[a-zA-Z]:)/.test(templatePath);
};
exports.resolveLocal = function resolveLocal(...args) {
    return path.join(__dirname, '../../', ...args);
};

exports.getTemplatePath = templatePath => {
    const cwd = process.cwd();
    return path.isAbsolute(templatePath) ? templatePath : path.normalize(path.join(cwd, templatePath));
};
exports.evaluate = (exp, data) => {
    /* eslint-disable no-new-func */
    const fn = new Function('data', 'with (data) { return ' + exp + '}');
    try {
        return fn(data);
    } catch (e) {
        console.error(chalk.red('Error when evaluating filter condition: ' + exp));
    }
};

let isYarn;
exports.hasYarn = () => {
    if (isYarn != null) {
        return isYarn;
    }
    try {
        execSync('yarnpkg --version', {stdio: 'ignore'});
        return (isYarn = true);
    } catch (e) {
        return (isYarn = false);
    }
};

exports.getGitUser = () => {
    let name;
    let email;

    try {
        name = execSync('git config --get user.name');
        email = execSync('git config --get user.email');
        email = email.toString().trim();
        name = JSON.stringify(name.toString().trim()).slice(1, -1);
        const t = email && ' <' + email.toString().trim() + '>';
        return {
            name,
            email,
            author: (name || '') + (t || ''),
            isBaidu: /@baidu\.com/.test(email)
        };
    } catch (e) {
        return {};
    }
};

exports.findExisting = (context, files) => {
    for (const file of files) {
        if (fs.existsSync(path.join(context, file))) {
            return file;
        }
    }
};
