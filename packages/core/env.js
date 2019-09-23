/**
 * @file env
 * @author yanyiting <yanyiting@baidu.com>
 */

const {execSync} = require('child_process');

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
