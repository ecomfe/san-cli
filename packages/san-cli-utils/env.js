/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 跟环境相关的函数
 * @author ksky521
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

exports.currentOS = () => ({
    isWindows: process.platform === 'win32',
    isMacintosh: process.platform === 'darwin',
    isLinux: process.platform === 'linux'
});
